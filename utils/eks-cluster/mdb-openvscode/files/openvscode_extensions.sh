OPENVSCODE_SERVER_ROOT="/home/.openvscode-server"
OPENVSCODE="${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server"

echo "Starting OpenVSCode Server Extension Installation"

for ext in "mongodb.mongodb-vscode" "humao.rest-client" "saoudrizwan.claude-dev"; do
    echo "Installing extension: ${ext}"
    ${OPENVSCODE} --install-extension "${ext}"
done

echo "OpenVSCode Server Extension Installed Successfully"
