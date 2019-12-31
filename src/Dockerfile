FROM kartoza/postgis:latest

RUN apt-get update -y
RUN apt-get install golang python3-dev libpq-dev python3-pip -y

RUN mkdir /app

COPY . /app
WORKDIR /app
RUN python3 -m pip install -r requirements.txt

