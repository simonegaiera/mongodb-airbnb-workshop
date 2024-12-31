#!/bin/bash

# Start Nginx in the background
nginx &

# Start OpenVSCode Server
su -m openvscode-server -c "exec ${OPENVSCODE} --host 0.0.0.0 --port 8000 --without-connection-token"
