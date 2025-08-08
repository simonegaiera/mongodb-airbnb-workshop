#!/bin/bash

# Ensure we're using the colima context
echo "Setting Docker context to colima..."
docker context use colima

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker daemon is not running. Please start Docker Desktop or Colima."
    exit 1
fi

# Configuration
REPO_NAME="ai-arena-mdb-openvscode"
REGION="us-east-2"
PROFILE="Solution-Architects.User-979559056307"
DOCKERFILE="mdb-openvscode.dockerfile"
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE --query Account --output text)
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Generate version tag (you can customize this logic)
VERSION_TAG=$(date +%Y%m%d-%H%M%S)
# Alternative: use git commit hash if in a git repo
# VERSION_TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d-%H%M%S)

echo "Using AWS Account ID: $ACCOUNT_ID"
echo "Version tag: $VERSION_TAG"

# Fix Docker credential helper for Colima
echo "Configuring Docker for Colima..."
mkdir -p ~/.docker
cat > ~/.docker/config.json << EOF
{
  "credsStore": "",
  "currentContext": "colima",
  "cliPluginsExtraDirs": [
    "/opt/homebrew/lib/docker/cli-plugins"
  ]
}
EOF

echo "Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names $REPO_NAME --region $REGION --profile $PROFILE 2>/dev/null || \
aws ecr create-repository --repository-name $REPO_NAME --region $REGION --profile $PROFILE --tags Key=noreap,Value=true

echo "Logging into ECR..."
aws ecr get-login-password --region $REGION --profile $PROFILE | \
docker login --username AWS --password-stdin $ECR_URI

# Ensure we're still using colima context after login
docker context use colima

# Check if buildx is available and setup cross-platform builds
echo "Checking Docker buildx availability..."
mkdir -p logs
if docker buildx version >/dev/null 2>&1; then
    echo "Docker buildx found, setting up for cross-platform builds..."
    docker buildx create --name multiarch --driver docker-container --use 2>/dev/null || docker buildx use multiarch 2>/dev/null || docker buildx use default
    echo "Building Docker image for AMD64 architecture with buildx..."
    LOG_FILE="logs/build-$(date +%Y%m%d-%H%M%S).log"
    echo "Build logs will be saved to $LOG_FILE"
    docker buildx build --platform linux/amd64 -t $REPO_NAME -f $DOCKERFILE . --load 2>&1 | tee $LOG_FILE
else
    echo "Docker buildx not available, using regular docker build..."
    echo "Note: Building for native architecture. This may cause issues if deploying to different architecture."
    echo "To enable buildx support in Colima, restart with: colima start --docker-buildx"
    LOG_FILE="logs/build-$(date +%Y%m%d-%H%M%S).log"
    echo "Build logs will be saved to $LOG_FILE"
    docker build -t $REPO_NAME -f $DOCKERFILE . 2>&1 | tee $LOG_FILE
fi

echo "Tagging image..."
docker tag $REPO_NAME:latest $ECR_URI/$REPO_NAME:latest
docker tag $REPO_NAME:latest $ECR_URI/$REPO_NAME:$VERSION_TAG

echo "Pushing images to ECR..."
docker push $ECR_URI/$REPO_NAME --all-tags

echo "Deploy complete!"
echo ""
echo "=== HELM DEPLOYMENT INFORMATION ==="
echo "Repository URI: $ECR_URI/$REPO_NAME"
echo "Available tags: latest, $VERSION_TAG"
echo "Region: $REGION"
echo "Account ID: $ACCOUNT_ID"
echo ""
echo "Full image paths:"
echo "  $ECR_URI/$REPO_NAME:latest"
echo "  $ECR_URI/$REPO_NAME:$VERSION_TAG"
