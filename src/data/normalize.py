import os
import psycopg2
import csv
import json


def create_connection():
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = psycopg2.connect(
            host='localhost', user='winston', password='winston', port=5432, database='gis'
        )
        return conn
    except Error as e:
        print(e)


# Get station in a dictionary with pair an integer
with open('geojson/Metro_Stations.geojson', 'r') as f:
    stations_geojson = json.loads(f.read())

stations = {}
k = 0
for station in stations_geojson['features']:
    station_name = station['properties']['STAT_NAME']
    if station_name in stations:
        continue
    else:
        stations[station_name] = k
        k += 1


con = create_connection()
cur = con.cursor()

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
    data = (count, stations[dept_station], stations[arr_station], row[2], row[3], row[4])
    cur.execute(
        'INSERT INTO fares (fid,dept,arr,peak,offpeak,reduced) VALUES (%s, %s, %s, %s, %s, %s)',
        data,
    )

# Create stations table
cur.execute('DROP TABLE IF EXISTS stations;')
cur.execute(
    """CREATE TABLE stations(
        sid INT NOT NULL PRIMARY KEY,
        station varchar(100));"""
)

# Insert stations into postgres
for key, value in stations.items():
    cur.execute('INSERT INTO stations (sid, station) VALUES (%s, %s)', (value, key))

cur.close()
con.commit()
