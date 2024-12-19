#!/bin/bash

# Check if directory is empty and change ownership if it is
if [ -z "$(ls -A /home/workspace/mongodb-airbnb-workshop)" ]; then
    echo "Directory is empty. Changing ownership."
    chown -R openvscode-server:openvscode-server /home/workspace/mongodb-airbnb-workshop
else
    echo "Directory is not empty. Ownership not changed."
fi

# Execute the user-specific operations script as the desired user
echo "Starting operations as user openvscode-server"
sudo -u openvscode-server bash /tmp/user_operations.sh

echo "Script executed successfully"
