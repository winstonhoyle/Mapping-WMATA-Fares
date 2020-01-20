#!/bin/sh

# Remove old container
docker rm -f /app

# Build app
docker build . -t wmatafares

# Run app
docker run \
	-e POSTGRES_USER=winston \
	-e POSTGRES_PASS=winston \
	-e POSTGRES_DBNAME=wmatafares \
	-p 5432:5432 \
	-d \
	--name app \
	-it wmatafares

echo "Sleeping for 15 seconds so the database can start up"

# Sleep so the database can start up
sleep 15

# Run script to normalize tables and import geometry data
docker exec -it app python3 data/normalize.py

