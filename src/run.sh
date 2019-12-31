docker build . -t app

docker run \
	-e POSTGRES_USER=winston \
	-e POSTGRES_PASS=winston \
	-e POSTGRES_DBNAME=wmatafares \
	-p 5432:5432 \
	-itd app
