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