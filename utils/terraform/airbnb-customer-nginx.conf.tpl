server {
    listen 80;
    listen [::]:80;
    server_name ${server_name};

    location / {
        proxy_pass http://${proxy_pass}:8000;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }
}
