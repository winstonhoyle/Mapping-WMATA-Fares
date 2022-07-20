import json
import os
import sqlite3

from requests import Response, get

# To be used in future versions
from config import Config

config = Config('.env')

with open('data/metro_stations.geojson', 'r') as f:
    stations_dict = json.load(f)

# Create `fares.db`
db = 'fares.db'
if os.path.isfile(db):
    os.remove(db)

conn = sqlite3.connect(db)
cursor = conn.cursor()

# Create stations table
create_stations_table_sql = """
CREATE TABLE stations (
    sid int PRIMARY KEY,
    station TEXT,
    coordinates TEXT
);
"""
cursor.execute(create_stations_table_sql)

# Create fares table
create_fares_table_sql = """
CREATE TABLE fares (
    dept TEXT,
    arr TEXT,
    peak REAL,
    offpeak REAL,
    reduced REAL
);
"""
cursor.execute(create_fares_table_sql)

# Commit the creation of two tables
conn.commit()

# Get station names
station_names_tuple = [
    (
        i,
        feature['properties']['NAME'],
        ','.join(map(str, feature['geometry']['coordinates'][::-1])),
    )
    for i, feature in enumerate(stations_dict['features'])
]

# Insert names into db and commit
insert_station_names_table_sql = """
INSERT INTO stations(sid, station, coordinates) VALUES(?, ?, ?);
"""
cursor.executemany(insert_station_names_table_sql, station_names_tuple)
conn.commit()

# Insert fare information into db
insert_fare_sql = """
INSERT INTO fares(dept, arr, peak, offpeak, reduced) VALUES(?, ?, ?, ?, ?)
"""

url = 'https://www.wmata.com/node/wmata/wmataAPI/tripPlanner'

# Function because WMATA Tripplanner API sometimes wants LatLong and sometimes does not
def reformat_request(params: dict) -> Response:
    params.pop('locationlatlong')
    params.pop('destinationlatlong')
    resp = get(url, params=params)
    if 'Error' in resp.json():
        print(f"{params['location']} to {params['destination']}")
        print(resp.json())
        print(resp.url + '\n')
    return resp


for did, dept, dept_coords in station_names_tuple:
    records = []
    for aid, arr, arr_coords in station_names_tuple:
        # If stations are the same
        if did == aid:
            # $0.00 because the stations are the same
            record = (did, aid, 0.0, 0.0, 0.0)
            cursor.execute(insert_fare_sql, record)
            continue

        peak_params = {
            'location': dept,
            'destination': arr,
            'travelby': 'CLR',
            'arrdep': 'D',
            'hour-leaving': '8',
            'minute-leaving': '00',
            'day-leaving': '26',
            'walk-distance': '0.25',
            'month-leaving': '9',
            'period-leaving': 'AM',
            'route': 'W',
            'locationlatlong': dept_coords,
            'destinationlatlong': arr_coords,
        }

        offpeak_params = {
            'location': dept,
            'destination': arr,
            'travelby': 'CLR',
            'arrdep': 'D',
            'hour-leaving': '11',
            'minute-leaving': '30',
            'day-leaving': '26',
            'walk-distance': '0.25',
            'month-leaving': '9',
            'period-leaving': 'AM',
            'route': 'W',
            'locationlatlong': dept_coords,
            'destinationlatlong': arr_coords,
        }

        # Get Peak fare information
        resp_peak = get(url, params=peak_params)
        # If an error redo the request but without latlong as it causes problems at some stations
        if 'Error' in resp_peak.json():
            resp_peak = reformat_request(peak_params)
        else:
            resp_peak_dict = resp_peak.json()
            peak = float(
                resp_peak_dict['Response']['Plantrip']['Plantrip1']['Itin']['Regularfare']
            )
            reduced = float(
                resp_peak_dict['Response']['Plantrip']['Plantrip1']['Itin']['Reducedfare']
            )

        # Get offpeak fare, seperate request
        resp_offpeak = get(url, params=offpeak_params)
        # If an error redo the request but without latlong as it causes problems at some stations
        if 'Error' in resp_offpeak.json():
            resp_offpeak = reformat_request(offpeak_params)
        else:
            resp_offpeak_dict = resp_offpeak.json()
            offpeak = float(
                resp_offpeak_dict['Response']['Plantrip']['Plantrip1']['Itin']['Regularfare']
            )

        # Save records for bulk insert
        record = (did, aid, peak, offpeak, reduced)
        records.append(record)

    # Commit after each station
    cursor.executemany(insert_fare_sql, records)
    conn.commit()
    # Clean for new station
    records = []

# Clean
del cursor
del conn
