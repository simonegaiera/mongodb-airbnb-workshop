# OpenVSCodeOnline Docker

The following instructions outline the process for creating and testing a Docker image for OpenVSCodeOnline, as well as pushing the image to DockerHub.

## Local Testing

### 1. Build the Docker Image in Development Mode

- Build the Docker image without using cache:
  ```bash
  docker build --no-cache -t airbnb-workshop-openvscode .
  ```

- Run the Docker container, exposing necessary ports:
  ```bash
  docker run -d -p 3000:3000 -p 3001:3001 -p 5000:5000 -p 80:8080 airbnb-workshop-openvscode
  ```

- List the Docker images:
  ```bash
  docker images
  ```

- Tag the Docker image for DockerHub:
  ```bash
  docker tag airbnb-workshop-openvscode simonegaiera/airbnb-workshop-openvscode
  ```

- Push the Docker image to your DockerHub repository:
  ```bash
  docker push simonegaiera/airbnb-workshop-openvscode
  ```

### 2. Access the Docker Container via SSH

- List the running Docker containers to get the container ID:
  ```bash
  docker ps
  ```

- Access the Docker container's shell:
  ```bash
  docker exec -it <container_id> /bin/bash
  ```
  Replace `<container_id>` with the actual ID obtained from the previous command.

## Production

### Push to DockerHub for Production

- Build and push the Docker image for the `linux/amd64` platform without using cache:
  ```bash
  docker build --no-cache --platform linux/amd64 -t simonegaiera/airbnb-workshop-openvscode . --push
  ```
