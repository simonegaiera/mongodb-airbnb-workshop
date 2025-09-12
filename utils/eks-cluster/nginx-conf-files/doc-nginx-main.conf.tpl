server {
    listen [::]:443 ssl http2;
    listen 443 ssl http2;

    server_name ${server_name};

    ssl_certificate     /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;
    
    # SSL Security improvements - RESTRICTIVE CIPHER LIST
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_ecdh_curve secp384r1:secp256r1:x25519;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/tls.crt;
    resolver 8.8.8.8 8.8.4.4 1.1.1.1 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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
