server {
    server_name ${server_name};

    location / {
        proxy_pass http://${proxy_pass}:8000/;
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

    listen [::]:443 ssl;
    listen 443 ssl;

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;
}