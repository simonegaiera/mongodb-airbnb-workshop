server {
    listen 80  default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;

    # health check on HTTPS
    location /health {
        access_log off;
        return 200 'OK';
    }

    # tell nginx to map any 404 into /404.html
    error_page 404 /404.html;

    # serve the custom 404 page
    location = /404.html {
        root /usr/share/nginx/html;
    }
}

server {
    listen [::]:443 ssl;
    listen 443 ssl;

    server_name ${server_name};

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;

    # tell nginx to map any 404 into /404.html
    error_page 404 /404.html;

    # serve the custom 404 page
    location = /404.html {
        root /usr/share/nginx/html;
    }

    # serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
