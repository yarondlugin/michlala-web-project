#!/bin/bash
sudo docker build -t client:latest .
sudo docker build -t server:latest .

sudo docker run -d -p 443:443 -v /etc/ssl/certs:/etc/nginx/ssl/certs -v /etc/ssl/private:/etc/nginx/ssl/private --env-file .env client:latest
sudo docker run -d -p 8080:8080 -v /etc/ssl/certs:/etc/ssl/certs -v /etc/ssl/private:/etc/ssl/private --env-file .env server:latest