server {
    server_name ${server_name};

    # SSL Configuration
    listen [::]:443 ssl http2;
    listen 443 ssl http2;
    
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
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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

    # Serve static portal files
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

    location /backend/ {
        proxy_pass http://${proxy_pass}:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Enable CORS for CSV downloads
        proxy_hide_header 'Access-Control-Allow-Origin';
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Disposition' always;
    }
}