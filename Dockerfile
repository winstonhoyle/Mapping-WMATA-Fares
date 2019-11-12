FROM osgeo/gdal:latest

RUN apt-get update && apt-get install -y \
    python3-pip

COPY . /app

WORKDIR /app/src/app

RUN python3.6 -m pip install -r /app/requirements.txt

CMD python3.6 app.py
