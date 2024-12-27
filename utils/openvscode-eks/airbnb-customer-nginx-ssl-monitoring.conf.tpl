server {
    server_name ${server_name};

    location / {
        proxy_pass http://${proxy_pass}:80/;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }

    listen [::]:443 ssl;
    listen 443 ssl;

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;
}