server {
    if ($host = ${server_name}.mongosa.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name ${server_name}.mongosa.com;
    # return 404;

    location /health {
        access_log off;
        return 200 'OK';
    }
}