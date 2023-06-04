#!/bin/bash

DELAY=10

docker compose --file docker-compose.yml down
docker rm -f $(docker ps -a -q)
docker volume rm $(docker volume ls -q)

docker compose --file docker-compose.yml up -d

echo "Waiting for $DELAY seconds for MongoDB to start"

sleep $DELAY

docker exec mongo0 bash /scripts/rs-init.sh