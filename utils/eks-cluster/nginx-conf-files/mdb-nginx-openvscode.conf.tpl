server {
    server_name ${server_name};

    # Custom error pages
    error_page 502 503 504 /50x.html;
    error_page 404 /404.html;

    # Serve the custom 50x error page
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }

    # Serve the custom 404 page
    location = /404.html {
        root /usr/share/nginx/html;
        internal;
    }

    location = /app {
        return 301 /app/;
    }
    
    location /app/ {
        alias /mnt/vscode-${data_username}/mongodb-airbnb-workshop/app/out/;
        index index.html;
        try_files $uri $uri/ $uri.html /app/$uri.html /app/index.html;
    }

    location / {
        proxy_pass http://${proxy_pass}:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        proxy_connect_timeout 60s;
        proxy_buffering off;
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

    location /postgres/ {
        proxy_pass http://${proxy_pass}:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        rewrite ^/postgres/(.*)$ /$1 break;
    }

    listen [::]:443 ssl;
    listen 443 ssl;

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;
}