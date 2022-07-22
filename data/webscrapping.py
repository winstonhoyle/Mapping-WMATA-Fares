import json
import os
import sqlite3

from requests import JSONDecodeError, Response, get

# Get station dict info
with open('data/metro_stations.geojson', 'r') as f:
    stations_dict = json.load(f)

# Closed stations info, will insert 0 for fare information, some stations are closed for months
with open('data/closed_stations.json', 'r') as f:
    closed_stations_dict = json.load(f)
    closed_stations = closed_stations_dict['closed']

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

# Function because WMATA Tripplanner API sometimes wants LatLong and sometimes does not
def format_request(params: dict) -> Response:
    url = 'https://www.wmata.com/node/wmata/wmataAPI/tripPlanner'
    resp = get(url, params=params)
    if 'Error' in resp.json():
        if 'locationlatlong' in params:
            params.pop('locationlatlong')
            params.pop('destinationlatlong')
        resp = get(url, params=params)
    return resp


def get_fare(location: tuple, destination: tuple) -> tuple:
    # Tuple variables
    lid = location[0]
    location_station = location[1]
    location_coords = location[2]
    did = destination[0]
    destination_station = destination[1]
    destination_coords = destination[2]

    if (
        lid == did
        or destination_station in closed_stations
        or location_station in closed_stations
    ):
        # $0.00 because the stations are the same
        record = (lid, did, 0.0, 0.0, 0.0)
        return record

    params = {
        'location': location_station,
        'destination': destination_station,
        'travelby': 'CLR',
        'arrdep': 'D',
        'hour-leaving': '8',
        'minute-leaving': '00',
        'day-leaving': '1',
        'walk-distance': '0.25',
        'month-leaving': '9',
        'period-leaving': 'AM',
        'route': 'W',
        'locationlatlong': location_coords,
        'destinationlatlong': destination_coords,
    }

    # Get Peak fare information
    try:
        resp_peak = format_request(params=params)
        resp_peak_dict = resp_peak.json()
        # If an error set value at 0
        if 'Error' in resp_peak_dict:
            print(f'Error in response: {location[1]} -> {destination[1]}')
            print(f'Error json: {json.dumps(resp_peak_dict)}')
    except Exception as e:
        print(f'Exception: {location[1]} -> {destination[1]} \n {e}')

    # Get offpeak fare, seperate request
    # Update time to offpeak
    params['hour-leaving'] = '11'
    params['minute-leaving'] = '30'
    try:
        resp_offpeak = format_request(params=params)
        resp_offpeak_dict = resp_offpeak.json()
        # If still an error set value at 0
        if 'Error' in resp_offpeak_dict:
            print(f'Error in response: {location[1]} -> {destination[1]}')
            print(f'Error json: {json.dumps(resp_peak_dict)}')
    except Exception as e:
        print(f'Exception: {location[1]} -> {destination[1]} \n {e}')

    try:
        peak = float(
            resp_peak_dict['Response']['Plantrip']['Plantrip1']['Itin']['Regularfare']
        )
        reduced = float(
            resp_peak_dict['Response']['Plantrip']['Plantrip1']['Itin']['Reducedfare']
        )
        offpeak = float(
            resp_offpeak_dict['Response']['Plantrip']['Plantrip1']['Itin']['Regularfare']
        )
    except (KeyError, UnboundLocalError) as e:
        peak = 0.0
        offpeak = 0.0
        reduced = 0.0
        print(f'Error in get_fares func: {location_station} -> {destination_station}\n{e}')

    return (lid, did, peak, offpeak, reduced)


# Get fare info and insert into database
for location in station_names_tuple:
    records = []
    for destination in station_names_tuple:
        record = get_fare(location=location, destination=destination)
        records.append(record)

    # Commit after each station
    cursor.executemany(insert_fare_sql, records)
    conn.commit()

# Clean
del cursor
del conn
