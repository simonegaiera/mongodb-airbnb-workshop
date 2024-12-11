docker build --no-cache -t airbnb-workshop-openvscode .
docker run -d -p 3000:3000 -p 3001:3001 -p 5000:5000 -p 80:8080 airbnb-workshop-openvscode

docker images
docker tag airbnb-workshop-openvscode simonegaiera/airbnb-workshop-openvscode

docker push simonegaiera/airbnb-workshop-openvscode


docker build --no-cache --platform linux/amd64 -t simonegaiera/airbnb-workshop-openvscode . --push
