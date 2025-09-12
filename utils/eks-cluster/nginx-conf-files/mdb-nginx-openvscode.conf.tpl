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

        rewrite ^/react/(.*)$ /$1 break;
    }

    location /backend/ {
        proxy_pass http://${proxy_pass}:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        proxy_connect_timeout 60s;
        proxy_buffering off;

        rewrite ^/backend/(.*)$ /$1 break;
    }

    location /postgres/ {
        proxy_pass http://${proxy_pass}:5001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        proxy_connect_timeout 60s;
        proxy_buffering off;

        rewrite ^/postgres/(.*)$ /$1 break;
    }

    listen [::]:443 ssl http2;
    listen 443 ssl http2;

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;
    
    # SSL Security improvements - RESTRICTIVE CIPHER LIST
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_ecdh_curve secp384r1;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}