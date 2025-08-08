# Quick Start: Local Testing & AWS ECR Deployment

## Local Testing with Colima

1. **Install Colima and Docker CLI:**
   ```bash
   brew install colima docker
   brew install docker-buildx
   ```

2. **Start Colima:**
   ```bash
   colima start
   ```

3. **Build the Docker image:**
   ```bash
   # For local testing (native architecture)
   docker build -t mdb-openvscode:test -f mdb-openvscode.dockerfile .
   
   # For cross-platform builds (e.g., building AMD64 on Apple Silicon)
   docker buildx build --platform linux/amd64 -t mdb-openvscode:test -f mdb-openvscode.dockerfile . --load
   ```

4. **Run the container (detached mode):**
   ```bash
   docker run -d -p 3000:3000 --name openvscode-test mdb-openvscode:test
   ```

5. **Stop and remove the container:**
   ```bash
   docker stop openvscode-test
   docker rm openvscode-test
   ```

6. **Remove the Docker image:**
   ```bash
   docker rmi mdb-openvscode:test
   ```

7. **Clean up unused Docker resources (optional):**
   ```bash
   docker system prune -a
   ```

8. **Stop Colima (optional):**
   ```bash
   colima stop
   ```

---

## Deploy to AWS ECR

1. **Configure your AWS CLI profile**  
   Make sure your AWS CLI is configured and you have the correct profile set in `deploy.sh` (`Solution-Architects.User-979559056307`).

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

   The script will:
   - Check if Docker is running (Colima or Docker Desktop)
   - Build and tag the image
   - Create the ECR repository if it does not exist (with the `noreap=true` tag)
   - Push the image to AWS ECR

3. **After deployment, the script will output Helm deployment information:**
   - ECR repository URI
   - Image tag
   - Example Helm install command

---

## Helm Deployment Example

Use the output from `deploy.sh` for your Helm chart values
---

**Tip:**  
If you don’t have Docker Desktop, Colima is recommended for Mac users.
