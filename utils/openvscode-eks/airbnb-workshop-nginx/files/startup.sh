#!/bin/bash

NGINX_CONF="/etc/nginx/nginx.conf"
SEARCH_STRING="server_names_hash_bucket_size 128;"

# Check if the http block contains the directive
if ! grep -qF "${SEARCH_STRING}" "${NGINX_CONF}"; then
    # Add the line INSIDE the http { block, before other content
    sed -i "/http {/a\    ${SEARCH_STRING}" "${NGINX_CONF}"
    echo "Added '${SEARCH_STRING}' to nginx.conf"
else
    echo "The line '${SEARCH_STRING}' already exists in nginx.conf"
fi

# Test NGINX configuration for syntax errors before reload
nginx -t
if [ $? -eq 0 ]; then
    # Reload NGINX configuration
    nginx -s reload
else
    echo "NGINX configuration test failed. Fix the errors before reloading."
fi
