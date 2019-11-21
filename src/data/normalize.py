import os, sqlite3, csv, json

def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)

# Get station in a dictionary with pair an integer 
with open("geojson/Metro_Stations.geojson", "r") as f:
    stations_geojson = json.loads(f.read())

stations = {}
k = 0
for station in stations_geojson["features"]:
    station_name = station["properties"]["STAT_NAME"]
    if station_name in stations:
        continue
    else:
        stations[station_name] = k
        k += 1

os.mkdir("tables")

# Open standard fare information
all_stations = open("all_stations.csv", "r")
reader = csv.reader(all_stations, delimiter=',')

# Create and write in normalized table for fares information
fares = open("tables/fares.csv", "w")
fares_writer = csv.writer(fares, delimiter=",")
next(reader)
fares_writer.writerow(["DEPT_STATION","ARR_STATION","STND_PEAK", "STND_OFFPEAK","REDUCED"])
for row in reader:
    dept_station = row[0]
    arr_station = row[1]
    fares_writer.writerow([stations[dept_station], stations[arr_station], row[2], row[3], row[4]])
fares.close()

# Create table for stations
stations_file = open("tables/stations.csv", "w")
stations_writer = csv.writer(stations_file, delimiter=",")
stations_writer.writerow(["SID","Station"])
for key, value in stations.items():
    stations_writer.writerow([value, key])
stations_file.close()

conn = create_connection("data.db")
cur = conn.cursor()
cur.execute("CREATE TABLE stations (SID, STATION);")

with open("tables/stations.csv", "wb") as f:
    dr = csv.DictReader(f)
    to_db = [(i['SID'], i['STATION']) for i in dr]

cur.executemany("INSERT INTO stations (SID, STATION) VALUES (?, ?);", to_db)
conn.commit()
conn.close()

