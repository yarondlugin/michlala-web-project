#!/bin/bash
sudo docker build -t client:latest --build-arg VITE_SERVER_URL=https://server:8080 --build-arg VITE_GOOGLE_CLIENT_ID= --build-arg VITE_POSTS_PER_PAGE=20 .
sudo docker build -t server:latest .

sudo docker run -d -p 443:443 --network=network --name=client -v /etc/ssl/certs:/etc/nginx/ssl/certs -v /etc/ssl/private:/etc/nginx/ssl/private client:latest
sudo docker run -d -p 8080:8080 --network=network --name=server -v /etc/ssl/certs:/etc/ssl/certs -v /etc/ssl/private:/etc/ssl/private --env-file .env server:latest