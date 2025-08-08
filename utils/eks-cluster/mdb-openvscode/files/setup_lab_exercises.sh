#!/bin/bash

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
}

# Function to setup lab exercises based on instructions configuration
setup_lab_exercises() {
    local repo_path="$1"
    local scenario_config="$2"
    
    echo_with_timestamp "Setting up lab exercises based on configuration"
    
    # Extract instructions from scenario config
    local instructions=$(echo "$scenario_config" | jq -r '.instructions // empty')
    
    if [ -z "$instructions" ] || [ "$instructions" = "null" ]; then
        echo_with_timestamp "No instructions found in configuration, keeping all lab exercises as-is"
        return 0
    fi
    
    # Extract base navigation file
    local base_nav=$(echo "$instructions" | jq -r '.base // "navigation-guided.yml"')
    echo_with_timestamp "Using base navigation: $base_nav"
    
    # Extract sections array
    local sections=$(echo "$instructions" | jq -r '.sections // []')
    
    if [ "$sections" = "[]" ] || [ "$sections" = "null" ]; then
        echo_with_timestamp "No sections specified, all exercises will be available"
        return 0
    fi
    
    # Create arrays to track which exercises should be kept vs replaced with answers
    local exercises_to_keep=()
    local exercises_to_replace=()
    
    # Get all available lab files
    local all_lab_files=($(ls "$repo_path/server/src/lab/"*.lab.js 2>/dev/null | xargs -n 1 basename))
    
    # Initialize all exercises as needing replacement (answers)
    for lab_file in "${all_lab_files[@]}"; do
        exercises_to_replace+=("$lab_file")
    done
    
    # Process each section in the instructions
    local section_count=$(echo "$sections" | jq '. | length')
    
    for ((i=0; i<section_count; i++)); do
        local section=$(echo "$sections" | jq -r ".[$i]")
        local section_title=$(echo "$section" | jq -r '.title // ""')
        local section_content=$(echo "$section" | jq -r '.content // []')
        
        echo_with_timestamp "Processing section: $section_title"
        
        # Process section content - if content is empty/null, try to infer from title
        if [ "$section_content" = "[]" ] || [ "$section_content" = "null" ]; then
            # Try to infer exercise type from section title
            infer_exercises_from_title "$section_title" exercises_to_keep exercises_to_replace "$repo_path"
        else
            # Process specific content items
            process_section_content "$section_content" exercises_to_keep exercises_to_replace
        fi
    done
    
    # Apply the exercise setup
    apply_exercise_setup "$repo_path" exercises_to_keep exercises_to_replace
}

# Function to mark exercises to keep based on pattern
mark_exercises_to_keep() {
    local pattern="$1"
    local -n keep_array=$2
    local -n replace_array=$3
    local repo_path="$4"
    
    # Find matching files
    for lab_file in $(ls "$repo_path/server/src/lab/" | grep -E "$pattern" 2>/dev/null); do
        # Add to keep array if not already there
        if [[ ! " ${keep_array[@]} " =~ " ${lab_file} " ]]; then
            keep_array+=("$lab_file")
        fi
        
        # Remove from replace array
        for i in "${!replace_array[@]}"; do
            if [[ "${replace_array[i]}" = "$lab_file" ]]; then
                unset 'replace_array[i]'
            fi
        done
    done
}

# Function to infer exercises from section title when content is empty
infer_exercises_from_title() {
    local section_title="$1"
    local -n keep_array=$2
    local -n replace_array=$3
    local repo_path="$4"
    
    echo_with_timestamp "Inferring exercises from title: $section_title"
    
    # Convert title to lowercase for pattern matching
    local title_lower=$(echo "$section_title" | tr '[:upper:]' '[:lower:]')
    
    # Pattern matching for different exercise types
    if [[ "$title_lower" =~ crud.*operations.*\(1\)|crud.*\(1\)|crud.*1 ]]; then
        echo_with_timestamp "Detected CRUD Operations (1) - including crud-1 to crud-4"
        mark_exercises_to_keep "crud-[1-4].lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ crud.*operations.*\(2\)|crud.*\(2\)|crud.*2 ]]; then
        echo_with_timestamp "Detected CRUD Operations (2) - including crud-5 to crud-8"
        mark_exercises_to_keep "crud-[5-8].lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ crud ]]; then
        echo_with_timestamp "Detected CRUD section - including all crud exercises"
        mark_exercises_to_keep "crud-*.lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ aggregation ]]; then
        echo_with_timestamp "Detected Aggregations section - including pipeline exercises"
        mark_exercises_to_keep "pipeline-*.lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ pipeline ]]; then
        echo_with_timestamp "Detected Pipeline section - including pipeline exercises"
        mark_exercises_to_keep "pipeline-*.lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ vector.*search ]]; then
        echo_with_timestamp "Detected Vector Search section - including vector-search exercises"
        mark_exercises_to_keep "vector-search-*.lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ search ]]; then
        echo_with_timestamp "Detected Search section - including search exercises"
        mark_exercises_to_keep "search-*.lab.js" keep_array replace_array "$repo_path"
    elif [[ "$title_lower" =~ index ]]; then
        echo_with_timestamp "Detected Indexes section - navigation only (no lab files)"
    else
        echo_with_timestamp "Could not infer exercise type from title: $section_title"
        echo_with_timestamp "Available patterns: crud, aggregation/pipeline, search, vector search, index"
    fi
}

# Function to process section content (specific exercise URLs)
process_section_content() {
    local content="$1"
    local -n keep_array=$2
    local -n replace_array=$3
    
    local content_count=$(echo "$content" | jq '. | length')
    
    for ((j=0; j<content_count; j++)); do
        local content_item=$(echo "$content" | jq -r ".[$j]")
        
        # Extract exercise number from URL pattern like "/crud/1/" or "/search/2/"
        if [[ "$content_item" =~ ^/([^/]+)/([0-9]+)/$ ]]; then
            local exercise_type="${BASH_REMATCH[1]}"
            local exercise_num="${BASH_REMATCH[2]}"
            local lab_file="${exercise_type}-${exercise_num}.lab.js"
            
            echo_with_timestamp "Including exercise: $lab_file"
            
            # Add to keep array if not already there
            if [[ ! " ${keep_array[@]} " =~ " ${lab_file} " ]]; then
                keep_array+=("$lab_file")
            fi
            
            # Remove from replace array
            for i in "${!replace_array[@]}"; do
                if [[ "${replace_array[i]}" = "$lab_file" ]]; then
                    unset 'replace_array[i]'
                fi
            done
        fi
    done
}

# Function to apply the exercise setup (keep labs or replace with answers)
apply_exercise_setup() {
    local repo_path="$1"
    local -n keep_array=$2
    local -n replace_array=$3
    
    echo_with_timestamp "Applying exercise setup..."
    
    # Keep exercises that should remain as labs
    echo_with_timestamp "Exercises to keep as labs:"
    for exercise in "${keep_array[@]}"; do
        echo_with_timestamp "  - $exercise (keeping as lab)"
    done
    
    # Replace exercises with answers
    echo_with_timestamp "Exercises to replace with answers:"
    for exercise in "${replace_array[@]}"; do
        if [ -f "$repo_path/utils/answers/$exercise" ]; then
            echo_with_timestamp "  - $exercise (replacing with answer)"
            cp "$repo_path/utils/answers/$exercise" "$repo_path/server/src/lab/$exercise"
        else
            echo_with_timestamp "  - $exercise (answer file not found, keeping as lab)"
        fi
    done
}

# Function to setup navigation based on instructions
setup_navigation() {
    local repo_path="$1"
    local scenario_config="$2"
    
    echo_with_timestamp "Setting up navigation based on configuration"
    
    # Extract instructions from scenario config
    local instructions=$(echo "$scenario_config" | jq -r '.instructions // empty')
    
    if [ -z "$instructions" ] || [ "$instructions" = "null" ]; then
        echo_with_timestamp "No instructions found, using default navigation"
        return 0
    fi
    
    # Extract base navigation file
    local base_nav=$(echo "$instructions" | jq -r '.base // "navigation-guided.yml"')
    
    # Copy the base navigation file to the active navigation
    if [ -f "$repo_path/docs/_data/$base_nav" ]; then
        echo_with_timestamp "Using navigation file: $base_nav"
        cp "$repo_path/docs/_data/$base_nav" "$repo_path/docs/_data/navigation.yml"
    else
        echo_with_timestamp "Base navigation file $base_nav not found, keeping default"
    fi
}

# Main function to be called from user_operations.sh
main() {
    local repo_path="$1"
    local scenario_config="$2"
    local backend_type="$3"
    
    # Only process if backend is server and we have navigation instructions
    if [ "$backend_type" = "server" ]; then
        echo_with_timestamp "Backend is server, processing navigation and lab exercises"
        setup_navigation "$repo_path" "$scenario_config"
        setup_lab_exercises "$repo_path" "$scenario_config"
    else
        echo_with_timestamp "Backend is not server ($backend_type), skipping navigation and lab setup"
    fi
}

# If script is run directly (not sourced), execute main with provided arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
