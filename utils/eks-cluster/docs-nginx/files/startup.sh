#!/bin/bash

# Exit on any error
set -e

#########################################
# Read Configuration from Enhanced ConfigMap
#########################################
echo "Reading enhanced scenario configuration..."
if [ ! -f "/etc/scenario-config/enhanced-scenario-config.json" ]; then
    echo "ERROR: enhanced-scenario-config.json not found in ConfigMap mount"
    exit 1
fi

# Parse JSON configuration using jq (install if not available)
# Install required packages for Alpine Linux
echo "Installing required packages..."
if command -v apk >/dev/null 2>&1; then
    apk update
    apk add jq git
    apk add --no-cache py3-yaml
elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y jq git python3 python3-yaml
else
    echo "ERROR: No supported package manager found (apk or apt-get)"
    exit 1
fi

# Extract configuration values from enhanced ConfigMap
SCENARIO=$(jq -r '.scenario // "guided"' /etc/scenario-config/enhanced-scenario-config.json)
AWS_ROUTE53_RECORD_NAME=$(jq -r '.aws_route53_record_name // "localhost"' /etc/scenario-config/enhanced-scenario-config.json)
REPOSITORY=$(jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop.git"' /etc/scenario-config/enhanced-scenario-config.json)
BRANCH=$(jq -r '.branch // "main"' /etc/scenario-config/enhanced-scenario-config.json)

echo "Scenario: $SCENARIO"
echo "Route53 Record Name: $AWS_ROUTE53_RECORD_NAME"
echo "Repository: $REPOSITORY"
echo "Branch: $BRANCH"

# Extract navigation from enhanced ConfigMap and convert to YAML
echo "Extracting navigation configuration from enhanced ConfigMap..."
cat > /tmp/extract_navigation.py << 'PYEOF'
#!/usr/bin/env python3
import json
import sys
import yaml

def extract_navigation_from_config():
    """Extract navigation configuration from enhanced ConfigMap JSON."""
    try:
        # Read the enhanced configuration file
        with open('/etc/scenario-config/enhanced-scenario-config.json', 'r') as f:
            config = json.load(f)
        
        # Extract navigation field
        navigation = config.get('navigation')
        
        if not navigation:
            print("No navigation field found in enhanced configuration", file=sys.stderr)
            return None
            
        print("Successfully extracted navigation from enhanced ConfigMap", file=sys.stderr)
        return navigation
        
    except FileNotFoundError:
        print("Enhanced scenario config file not found", file=sys.stderr)
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON configuration: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error extracting navigation from enhanced config: {e}", file=sys.stderr)
        return None

def main():
    navigation = extract_navigation_from_config()
    if navigation:
        # Output navigation as YAML to stdout
        yaml.dump(navigation, sys.stdout, default_flow_style=False, sort_keys=False)
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())
PYEOF

# Run the Python script to extract navigation from enhanced ConfigMap
python3 /tmp/extract_navigation.py > /tmp/navigation_from_configmap.yml
EXTRACTION_EXIT_CODE=$?

if [ $EXTRACTION_EXIT_CODE -ne 0 ]; then
    echo "ERROR: Failed to extract navigation from enhanced ConfigMap"
    exit 1
fi

echo "Successfully extracted navigation from enhanced ConfigMap"

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

echo "Using navigation configuration from enhanced ConfigMap..."
# Use the navigation data extracted from enhanced ConfigMap
cp /tmp/navigation_from_configmap.yml _data/navigation.yml

echo "Navigation content from enhanced ConfigMap:"
cat _data/navigation.yml

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
# Remove jekyll-remote-theme from plugins since we're using gem-based theme
sed -i '/jekyll-remote-theme/d' _config.yml

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
