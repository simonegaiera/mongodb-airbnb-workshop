#!/bin/bash    

# Function to perform operations as openvscode-server user
run_as_openvscode_user() {
    # Check if the repository exists and update or clone accordingly  
    if [ -d /home/workspace/mongodb-airbnb-workshop/.git ]; then    
        echo 'Repository exists. Pulling latest changes...';    
        cd /home/workspace/mongodb-airbnb-workshop && git pull;    
    else    
        echo 'Repository does not exist. Cloning...';    
        git clone https://github.com/simonegaiera/mongodb-airbnb-workshop /home/workspace/mongodb-airbnb-workshop;    
    fi    

    # Create the server directory and .env file with given content  
    mkdir -p /home/workspace/mongodb-airbnb-workshop/server  
    echo -e "PORT=5000\nMONGODB_URI=" > /home/workspace/mongodb-airbnb-workshop/server/.env  

    # Read the username from user.conf  
    USERNAME=$(tr -d '[:space:]' < /home/workspace/utils/user.conf)  
    URL=$(tr -d '[:space:]' < /home/workspace/utils/aws_route53_record_name.conf)  

    # Create the app directory if it doesn't exist  
    mkdir -p /home/workspace/mongodb-airbnb-workshop/app  

    # Create the .env file in the app directory using the username from user.conf  
    cat <<EOL > /home/workspace/mongodb-airbnb-workshop/app/.env
WORKSHOP_USER=/${USERNAME}
BACKEND_URL=https://${USERNAME}.${URL}/backend
EOL

    cd /home/workspace/mongodb-airbnb-workshop/app  
    npm install --legacy-peer-deps  
    npm run build  

    cd /home/workspace/mongodb-airbnb-workshop/server  
    npm install --legacy-peer-deps  
}

# Set ownership for the cloned repository  
chown -R openvscode-server:openvscode-server /home/workspace/mongodb-airbnb-workshop  

# Call the function with sudo to run as openvscode-server
sudo -u openvscode-server bash -c "$(declare -f run_as_openvscode_user); run_as_openvscode_user"
