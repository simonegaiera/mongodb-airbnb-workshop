#!/bin/bash

# Script to generate CSV of arena-terragrunt usage logs from S3
# Usage: ./view_usage_logs.sh [customer_name] [output_file]

set -e

BUCKET="mongodb-arena"
USAGE_LOGS_PREFIX="usage-logs/"
AWS_PROFILE="Solution-Architects.User-979559056307"
TEMP_DIR=$(mktemp -d)

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set output file path (in same directory as script)
OUTPUT_FILE="${2:-$SCRIPT_DIR/arena-terragrunt-usage.csv}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup on exit
trap "rm -rf $TEMP_DIR" EXIT

echo -e "${BLUE}Fetching arena-terragrunt usage logs from S3...${NC}\n"

# Download logs from S3
if [ -n "$1" ]; then
    # Download logs for specific customer
    CUSTOMER="$1"
    echo -e "${YELLOW}Filtering by customer: $CUSTOMER${NC}\n"
    aws s3 sync "s3://$BUCKET/$USAGE_LOGS_PREFIX$CUSTOMER/" "$TEMP_DIR/" --profile "$AWS_PROFILE" --quiet
else
    # Download all logs
    aws s3 sync "s3://$BUCKET/$USAGE_LOGS_PREFIX" "$TEMP_DIR/" --profile "$AWS_PROFILE" --quiet
fi

# Check if any logs were downloaded
if [ ! "$(ls -A $TEMP_DIR)" ]; then
    echo "No usage logs found."
    exit 0
fi

# Create CSV with header
echo "timestamp,customer,user,additional_users_count,project_name,cluster_name" > "$OUTPUT_FILE"

# Temporary file for deduplication
TEMP_CSV=$(mktemp)

# Process all JSON files and collect data
find "$TEMP_DIR" -name "*.json" -type f | sort | while read -r log_file; do
    # Parse JSON and extract fields
    timestamp=$(jq -r '.timestamp' "$log_file" 2>/dev/null || echo "N/A")
    customer=$(jq -r '.customer' "$log_file" 2>/dev/null || echo "N/A")
    user_arn=$(jq -r '.user' "$log_file" 2>/dev/null || echo "N/A")
    additional_users=$(jq -r '.additional_users_count' "$log_file" 2>/dev/null || echo "N/A")
    project_name=$(jq -r '.project_name' "$log_file" 2>/dev/null || echo "N/A")
    cluster_name=$(jq -r '.cluster_name' "$log_file" 2>/dev/null || echo "N/A")
    
    # Extract username from ARN (get last part after /)
    username=$(echo "$user_arn" | awk -F'/' '{print $NF}')
    
    # Extract date from timestamp (YYYY-MM-DD)
    date_only=$(echo "$timestamp" | cut -d'T' -f1)
    
    # Write to temp file with deduplication key
    echo "$date_only|$customer|$username|$timestamp|$additional_users|$project_name|$cluster_name" >> "$TEMP_CSV"
done

# Deduplicate: keep only last entry per date+customer+user combination
# Sort by dedup key and timestamp, then use awk to keep last occurrence
sort -t'|' -k1,3 -k4 "$TEMP_CSV" | awk -F'|' '
{
    key = $1 "|" $2 "|" $3
    # Always update the entry - last one wins
    entries[key] = $1 "," $2 "," $3 "," $5 "," $6 "," $7
}
END {
    for (key in entries) {
        print entries[key]
    }
}' >> "$OUTPUT_FILE"

# Cleanup temp file
rm -f "$TEMP_CSV"

# Count unique entries (subtract 1 for header)
TOTAL_ENTRIES=$(($(wc -l < "$OUTPUT_FILE") - 1))
TOTAL_JSON_FILES=$(find "$TEMP_DIR" -name "*.json" -type f | wc -l | tr -d ' ')

echo -e "${GREEN}✓ CSV file generated successfully!${NC}"
echo ""
echo -e "${BLUE}Output file:${NC} $OUTPUT_FILE"
echo -e "${BLUE}Unique entries:${NC} $TOTAL_ENTRIES (from $TOTAL_JSON_FILES JSON files)"
echo -e "${YELLOW}Note: Entries are deduplicated by date+customer+user${NC}"
echo ""
echo -e "${YELLOW}Tip: Run './view_usage_logs.sh customer-name output.csv' to filter by customer${NC}"

