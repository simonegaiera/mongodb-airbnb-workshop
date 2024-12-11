FROM gitpod/openvscode-server:latest

ENV OPENVSCODE_SERVER_ROOT="/home/.openvscode-server"
ENV OPENVSCODE="${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server"

SHELL ["/bin/bash", "-c"]

# Switch to root user to install packages
USER root

# Install git, Node.js (which includes npm), and Nginx
RUN apt-get update && \  
    apt-get install -y git curl nginx less vim net-tools lsof && \  
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \  
    apt-get install -y nodejs && \  
    npm install -g npm@latest && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN chown -R openvscode-server:openvscode-server /home/workspace/.npm

# Copy your Nginx configuration file into the container
COPY airbnb-workshop.conf /etc/nginx/sites-available/airbnb-workshop.conf
# Enable the Nginx configuration
RUN ln -s /etc/nginx/sites-available/airbnb-workshop.conf /etc/nginx/sites-enabled/
# Remove the default Nginx configuration if necessary
RUN rm /etc/nginx/sites-enabled/default

# Switch back to the original user
USER openvscode-server

# Clone the repository into a directory the user owns
RUN git clone https://github.com/simonegaiera/mongodb-airbnb-workshop /home/workspace/mongodb-airbnb-workshop

# Navigate to the app directory, install npm dependencies, and build the app
RUN cd /home/workspace/mongodb-airbnb-workshop/server && npm install
RUN cd /home/workspace/mongodb-airbnb-workshop/app && npm install --legacy-peer-deps && npm run build

# Switch to root to change permissions
USER root

# Add Nginx user to the openvscode-server group
RUN usermod -aG openvscode-server www-data

# Set group read permissions
RUN chmod -R 750 /home/workspace/mongodb-airbnb-workshop/app/out

# Switch back to the original user
USER openvscode-server

# Install extensions
RUN \
    exts=(\
        gitpod.gitpod-theme \
        mongodb.mongodb-vscode \
    ) \
    && for ext in "${exts[@]}"; do \
        ${OPENVSCODE} --install-extension "${ext}"; \
    done

# Expose ports for the application and Nginx
EXPOSE 3000
EXPOSE 5000
EXPOSE 8000
EXPOSE 8080

# Copy the startup script
USER root
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Set the entrypoint to the startup script
ENTRYPOINT ["/usr/local/bin/start.sh"]
