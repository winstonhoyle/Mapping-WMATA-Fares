import json
from datetime import datetime
from time import sleep

from data.station import Station, StationPair, Fare
from database.database import Database

# Set time for fares webscrapping. Set a time in the future with limited service disruptions
# This time is the peak time, the code handles nonpeak time. Peak is only rush hour on weekdays
# If any service disruptions please add those stations to `closed_stations.json`
# year, month, day, hour, minute, second format
time = datetime(2022, 10, 1, 8, 30, 0)

# Get station dict info
with open('data/metro_stations.geojson', 'r') as f:
    stations_dict = json.load(f)

# Closed stations info, will insert 0 for fare information, some stations are closed for months
with open('data/closed_stations.json', 'r') as f:
    closed_stations_dict = json.load(f)
    closed_stations = closed_stations_dict['closed']

# Create fares database
db_file = 'fares.db'
database = Database(db_file, create_tables=True)

# Get station names
station_objects = [
    Station(
        i,
        feature['properties']['NAME'],
        ','.join(map(str, feature['geometry']['coordinates'][::-1])),
    )
    for i, feature in enumerate(stations_dict['features'])
]

database.insert_station_names(station_objects)


def get_station_pair(departure_station: Station, arrival_station: Station) -> StationPair:
    """Return a StationPair object
    
    Get fare information by creating `StationPair` object, it's in this file due to
    closed_stations only being available in this file. 
    """
    station_pair = StationPair(departure_station, arrival_station, time=time)

    if (
        arrival_station.id == departure_station.id
        or departure_station.name in closed_stations
        or arrival_station.name in closed_stations
    ):
        # $0.00 because the stations are the same
        fare = Fare(peak=0.0, offpeak=0.0, reduced=0.0)
        station_pair.set_fare(fare)

        return station_pair

    station_pair = StationPair(departure_station, arrival_station)
    fare = station_pair.get_fare()
    station_pair.set_fare(fare)

    return station_pair


# Get fare info and insert into database
station_obj_len = len(station_objects)
count = 1
for departure_station in station_objects:
    station_pairs_data = []
    for arrival_station in station_objects:
        # Get `StationPair` object
        station_pair = get_station_pair(
            departure_station=departure_station, arrival_station=arrival_station
        )
        # Sleep timer to so there isn't continous requests to wmata. Was causing handshake errors
        sleep(0.5)
        # Create tuple and add to list for db insertion at end of loop
        fare_data = (
            station_pair.departure_station.id,
            station_pair.arrival_station.id,
            station_pair.fare.peak,
            station_pair.fare.offpeak,
            station_pair.fare.reduced,
        )
        station_pairs_data.append(fare_data)

    # Commit after each station
    database.insert_fares(station_pairs_data)
    database.conn.commit()
    print(f"{departure_station.name}: {count}/{station_obj_len}")
    count+=1

# Clean
del database.cursor
del database.conn
