import os
import psycopg2
from postgis.psycopg import register
from geomet import wkt
import csv
import json

conn = psycopg2.connect(
    host='localhost', user='winston', password='winston', port=5432, database='wmatafares'
)
register(conn)
cur = conn.cursor()

# Get station in a dictionary with pair an integer
with open('geojson/Metro_Stations.geojson', 'r') as f:
    stations_geojson = json.loads(f.read())

# Create stations table
cur.execute('DROP TABLE IF EXISTS stations;')
cur.execute(
    """CREATE TABLE stations(
        sid INT NOT NULL PRIMARY KEY,
        lines varchar(35),
        station varchar(40),
        geom geometry);"""
)

# Create a station reference to use in the fares for normalization
stations_ref = {}

# Insert stations into stations table
stations = stations_geojson['features']
for station in stations:
    prop = station['properties']
    name = prop['STAT_NAME']
    sid = prop['OBJECTID']
    if name in stations_ref:
        continue
    else:
        stations_ref[name] = sid
    data = (sid, prop['MetroLine'], name, wkt.dumps(station['geometry'], decimals=6))
    cur.execute(
        'INSERT INTO stations (sid, lines, station, geom) VALUES (%s, %s, %s, ST_GeometryFromText(%s, 4326))',
        data,
    )

# Open standard fare information
all_stations = open('all_stations.csv', 'r')
reader = csv.reader(all_stations, delimiter=',')

# Create fares tavle
cur.execute('DROP TABLE IF EXISTS fares;')
cur.execute(
    """CREATE TABLE fares (
        fid int NOT NULL PRIMARY KEY,
        dept int NOT NULL,
        arr int NOT NULL,
        peak real NOT NULL,
        offpeak real NOT NULL,
        reduced real NOT NULL
        );"""
)

# Insert fares into table
next(reader)
for count, row in enumerate(reader):
    dept_station = row[0]
    arr_station = row[1]
    data = (
        count,
        stations_ref[dept_station],
        stations_ref[arr_station],
        row[2],
        row[3],
        row[4],
    )
    cur.execute(
        'INSERT INTO fares (fid,dept,arr,peak,offpeak,reduced) VALUES (%s, %s, %s, %s, %s, %s)',
        data,
    )

# Create lines table
cur.execute('DROP TABLE IF EXISTS lines;')
cur.execute(
    """CREATE TABLE lines(
        lid INT NOT NULL PRIMARY KEY,
        line varchar(6),
        geom geometry);"""
)

with open('geojson/Metro_Lines.geojson', 'r') as f:
    lines_geojson = json.loads(f.read())

for line in lines_geojson:
    props = line['properties']
    data = (props['OBJECTID'], props['NAME'], wkt.dumps(line['geometry'], decimals=6))
    cur.execute('INSERT INTO lines (lid, line, geom) VALUES (%s, %s, %s)', data)

cur.close()
conn.commit()
