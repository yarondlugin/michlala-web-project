#!/bin/bash
docker build -t web-client .

docker run -p 443:443 -v /etc/ssl/certs:/etc/nginx/ssl/certs -v /etc/ssl/private:/etc/nginx/ssl/private web-client