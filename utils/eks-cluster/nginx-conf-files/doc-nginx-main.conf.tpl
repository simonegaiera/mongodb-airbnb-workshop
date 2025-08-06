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
        root ${index_path};
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location = /favicon.ico {
        alias /usr/share/nginx/html/favicon.ico;
        log_not_found   off;
        access_log      off;
        default_type    image/x-icon;
    }
}
