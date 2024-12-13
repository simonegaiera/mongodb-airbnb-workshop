server {
    server_name ${server_name};

    location / {
        proxy_pass http://${proxy_pass}:8000;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }

    location /vscode/ {
        proxy_pass http://${proxy_pass}:8000/;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;

        rewrite ^/vscode/(.*)$ /$1 break;
    }

    location /frontend/ {
        proxy_pass http://${proxy_pass}:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        rewrite ^/frontend/(.*)$ /$1 break;
    }

    location /react/ {
        proxy_pass http://${proxy_pass}:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        rewrite ^/react/(.*)$ /$1 break;
    }

    location /backend/ {
        proxy_pass http://${proxy_pass}:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        rewrite ^/backend/(.*)$ /$1 break;
    }

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/mongosa_cert/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mongosa_cert/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = ${server_name}.mongosa.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name ${server_name}.mongosa.com;
    return 404; # managed by Certbot
}