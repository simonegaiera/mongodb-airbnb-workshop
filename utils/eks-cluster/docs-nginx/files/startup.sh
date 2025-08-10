#!/bin/bash

# Exit on any error
set -e

#########################################
# Read Configuration from ConfigMap
#########################################
echo "Reading scenario configuration..."
if [ ! -f "/etc/scenario-config/scenario-config.json" ]; then
    echo "ERROR: scenario-config.json not found in ConfigMap mount"
    exit 1
fi

# Parse JSON configuration using jq (install if not available)
# Install required packages for Alpine Linux
echo "Installing required packages..."
if command -v apk >/dev/null 2>&1; then
    apk update
    apk add jq git
elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y jq git
else
    echo "ERROR: No supported package manager found (apk or apt-get)"
    exit 1
fi

# Extract configuration values
SCENARIO=$(jq -r '.scenario // "guided"' /etc/scenario-config/scenario-config.json)
AWS_ROUTE53_RECORD_NAME=$(jq -r '.aws_route53_record_name // "localhost"' /etc/scenario-config/scenario-config.json)
REPOSITORY=$(jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop.git"' /etc/scenario-config/scenario-config.json)
BRANCH=$(jq -r '.branch // "main"' /etc/scenario-config/scenario-config.json)
NAVIGATION_BASE=$(jq -r '.instructions.base // "navigation.yml"' /etc/scenario-config/scenario-config.json)

echo "Scenario: $SCENARIO"
echo "Route53 Record Name: $AWS_ROUTE53_RECORD_NAME"
echo "Repository: $REPOSITORY"
echo "Branch: $BRANCH"
echo "Navigation Base: $NAVIGATION_BASE"

#########################################
# Setup Dependencies
#########################################
echo "Installing dependencies..."
apk add --no-cache git build-base

echo "Installing Jekyll and Bundler..."
gem install jekyll bundler

#########################################
# Clone and Prepare Repository
#########################################
echo "Cloning repository..."
cd /tmp
git clone -b $BRANCH $REPOSITORY

# Extract repository name from URL (removes .git suffix if present)
REPO_NAME=$(basename "$REPOSITORY" .git)
echo "Repository name: $REPO_NAME"

cd "$REPO_NAME/docs"

echo "Current _config.yml content:"
cat _config.yml

#########################################
# Configure Jekyll Site
#########################################
echo "Modifying _config.yml..."
# Update the URL to use Route53 record
sed -i 's|^url:.*|url: "https://instructions.'"${AWS_ROUTE53_RECORD_NAME}"'"|g' _config.yml

echo "Copying navigation file based on scenario configuration..."
# Copy scenario-specific navigation file from instructions.base
if [ -f "_data/${NAVIGATION_BASE}" ]; then
    cp "_data/${NAVIGATION_BASE}" _data/navigation.yml
    echo "Copied ${NAVIGATION_BASE} to navigation.yml"
else
    echo "WARNING: ${NAVIGATION_BASE} not found in _data/, using default navigation.yml"
fi

# Filter navigation based on sections configuration
echo "Filtering navigation based on sections configuration..."
SECTIONS=$(jq -r '.instructions.sections // []' /etc/scenario-config/scenario-config.json)

# Check if sections array is empty
SECTIONS_COUNT=$(echo "$SECTIONS" | jq '. | length')

if [ "$SECTIONS_COUNT" -eq 0 ]; then
    echo "No sections filtering - keeping all navigation items"
else
    echo "Filtering navigation based on ${SECTIONS_COUNT} sections"
    
    # Create a temporary Python script to filter the navigation
    cat > /tmp/filter_navigation.py << 'PYEOF'
import yaml
import json
import sys

# Read the scenario config
with open('/etc/scenario-config/scenario-config.json', 'r') as f:
    config = json.load(f)

sections_config = config.get('instructions', {}).get('sections', [])

# Read the navigation YAML
with open('_data/navigation.yml', 'r') as f:
    nav = yaml.safe_load(f)

# If no sections specified, keep everything
if not sections_config:
    print("No sections filtering needed")
    sys.exit(0)

# Create a lookup for sections to keep
sections_to_keep = {}
for section in sections_config:
    title = section.get('title')
    content = section.get('content', [])
    sections_to_keep[title] = content

# Filter the docs navigation
if 'docs' in nav:
    filtered_docs = []
    
    for section in nav['docs']:
        section_title = section.get('title')
        
        if section_title in sections_to_keep:
            content_filter = sections_to_keep[section_title]
            
            # If content is empty or not specified, keep entire section
            if not content_filter:
                filtered_docs.append(section)
                print(f"Keeping entire section: {section_title}")
            else:
                # Filter children based on content URLs
                filtered_section = {
                    'title': section_title,
                    'children': []
                }
                
                if 'children' in section:
                    for child in section['children']:
                        child_url = child.get('url', '')
                        
                        # Keep if URL matches or if it's a hint for a matching URL
                        should_keep = False
                        for content_url in content_filter:
                            if child_url == content_url:
                                should_keep = True
                                break
                            # Check if this is a hint for the content URL
                            if child_url == content_url + 'hint/':
                                should_keep = True
                                break
                            # Also keep the base URL (without trailing number)
                            base_content_url = content_url.rstrip('/').rsplit('/', 1)[0] + '/'
                            if child_url == base_content_url:
                                should_keep = True
                                break
                        
                        if should_keep:
                            filtered_section['children'].append(child)
                            print(f"Keeping: {child.get('title')} ({child_url})")
                
                if filtered_section['children']:
                    filtered_docs.append(filtered_section)
                    print(f"Keeping filtered section: {section_title}")
        else:
            print(f"Removing section: {section_title}")
    
    nav['docs'] = filtered_docs

# Write the filtered navigation back
with open('_data/navigation.yml', 'w') as f:
    yaml.dump(nav, f, default_flow_style=False, sort_keys=False)

print("Navigation filtering completed")
PYEOF

    # Install PyYAML using Alpine package manager
    apk add --no-cache py3-yaml
    
    # Run the Python script to filter navigation
    python3 /tmp/filter_navigation.py
    
    echo "Filtered navigation.yml content:"
    cat _data/navigation.yml
fi

echo "Modified _config.yml content:"
cat _config.yml

#########################################
# Setup Jekyll Dependencies
#########################################
echo "Creating Gemfile..."
cat > Gemfile << 'EOF'
source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "minimal-mistakes-jekyll"

group :jekyll_plugins do
  gem "jekyll-include-cache"
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-gist"
  gem "jekyll-paginate"
end
EOF

echo "Installing Jekyll dependencies..."
bundle install

echo "Updating _config.yml to use gem-based theme..."
# Replace remote_theme with theme for proper gem installation
sed -i 's|remote_theme: mmistakes/minimal-mistakes@master|theme: minimal-mistakes-jekyll|g' _config.yml

echo "Final _config.yml content:"
cat _config.yml

#########################################
# Build and Deploy Site
#########################################
echo "Building Jekyll site..."
bundle exec jekyll build --destination /usr/share/nginx/html/instructions --verbose

echo "Setting proper permissions..."
chmod -R 755 /usr/share/nginx/html/instructions/

#########################################
# Completion
#########################################
echo "Build completed successfully!"
echo "Instructions directory contents:"
ls -la /usr/share/nginx/html/instructions/
