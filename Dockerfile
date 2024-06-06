FROM python:3.10

RUN apt-get update -y
RUN apt-get install libsqlite3-mod-spatialite -y

ENV SPATIALITE_LIBRARY_PATH=mod_spatialite.so

WORKDIR /usr/src/app

COPY requirements.txt .
RUN python3 -m pip install -r requirements.txt

COPY app/ app/
COPY data/gpkg/lines.gpkg lines.gpkg

ENV SQLALCHEMY_DATABASE_URL=sqlite:////usr/src/app/lines.gpkg

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" ]