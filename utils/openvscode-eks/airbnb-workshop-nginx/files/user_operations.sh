#!/bin/bash

# Add old Debian stretch repositories to the sources.list
echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list
echo "deb http://archive.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list

# Update package list and install necessary packages
apt-get update && \
apt-get install -y inotify-tools less nano vim && \
apt-get clean

# Ensure the NGINX configuration directory exists
if [ -d "/etc/nginx/conf.d" ]; then
    echo "Starting inotifywait for NGINX configuration changes..."

    # Monitor the NGINX configuration directory for changes
    while inotifywait -e modify /etc/nginx/conf.d/*; do
        echo 'Configuration change detected. Checking and reloading NGINX...'
        
        # Check NGINX configuration and reload if it's valid
        if nginx -t; then
            echo "NGINX configuration is valid. Reloading..."
            nginx -s reload
        else
            echo "NGINX configuration is invalid. Please check the syntax errors."
        fi

    done
else
    echo "/etc/nginx/conf.d does not exist. Please ensure NGINX is installed and this path is correct."
fi
