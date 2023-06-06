docker compose --file docker-compose.yml up -d
sleep 10
docker exec mongo0 bash /scripts/rs-init.sh