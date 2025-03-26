server {
    server_name ${server_name};

    location = /frontend {
        return 301 /frontend/;
    }
    
    location /frontend/ {
        alias /var/www/mongodb-airbnb-workshop/airbnb-workshop-openvscode-${data_username}/app/out/;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location / {
        proxy_pass http://${proxy_pass}:3000/;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }

    location /react/ {
        proxy_pass http://${proxy_pass}:3001/;
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