import os
import spatialite as spl
import csv
import json


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = spl.connect(db_file)
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

if os.path.isfile("data.db"):
    os.remove("data.db")
os.mkdir('tables')

# Open standard fare information
all_stations = open('all_stations.csv', 'r')
reader = csv.reader(all_stations, delimiter=',')

# Create and write in normalized table for fares information
fares = open('tables/fares.csv', 'w')
fares_writer = csv.writer(fares, delimiter=',')
next(reader)
fares_writer.writerow(
    ['FID', 'DEPT_STATION', 'ARR_STATION', 'STND_PEAK', 'STND_OFFPEAK', 'REDUCED']
)
for count, row in enumerate(reader):
    dept_station = row[0]
    arr_station = row[1]
    fares_writer.writerow(
        [count, stations[dept_station], stations[arr_station], row[2], row[3], row[4]]
    )
fares.close()

# Create table for stations
stations_file = open('tables/stations.csv', 'w')
stations_writer = csv.writer(stations_file, delimiter=',')
stations_writer.writerow(['SID', 'Station'])
for key, value in stations.items():
    stations_writer.writerow([value, key])
stations_file.close()

con = create_connection('data.db')
cur = con.cursor()
cur.execute('CREATE TABLE stations (sid INT, station STR, PRIMARY KEY(sid))')

with open('tables/stations.csv', 'r') as stations_table:
    dr = csv.DictReader(stations_table)
    to_db = [(i['SID'], i['Station']) for i in dr]

cur.executemany('INSERT INTO stations VALUES (?,?);', to_db)
con.commit()

cur.execute(
    'CREATE TABLE fares (fid INT, dept INT, arr INT, peak REAL, offpeak REAL, reduced REAL, PRIMARY KEY(fid))'
)
with open('tables/fares.csv', 'r') as fares_table:
    dr_fares = csv.DictReader(fares_table)
    to_db = [
        (
            i['FID'],
            i['DEPT_STATION'],
            i['ARR_STATION'],
            i['STND_PEAK'],
            i['STND_OFFPEAK'],
            i['REDUCED'],
        )
        for i in dr_fares
    ]

cur.executemany('INSERT INTO fares VALUES (?,?,?,?,?,?);', to_db)
con.commit()


os.system("rm -rf tables")
