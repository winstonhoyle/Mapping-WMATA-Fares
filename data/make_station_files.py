import csv
import json

from tqdm import tqdm

from wmata import WMATA


def main(api_key: str):

    # Create output objects for station name table
    stations_csvfile = open("csv/stations.csv", "w")
    station_field_names = ["code", "name", "station_id", "lat", "lon"]
    station_writer = csv.DictWriter(stations_csvfile, fieldnames=station_field_names)
    station_writer.writeheader()

    # Create output objects for fare table
    fare_csvfile = open("csv/fares.csv", "w")
    fare_field_names = ["src", "dst", "peak", "off_peak", "senior_disabled", "miles"]
    fare_writer = csv.DictWriter(fare_csvfile, fieldnames=fare_field_names)
    fare_writer.writeheader()

    geojson_dict = {"type": "FeatureCollection", "features": []}

    # Get a list of stations
    wmata = WMATA(api_key=api_key)
    all_station_info = wmata.get_all_station_information()

    stations = list(
        set([station_info["SourceStation"] for station_info in all_station_info])
    )

    # Loop through stations and get station names and geometry info
    station_dict = {}
    i = 1
    for station in tqdm(stations, desc="Looping through all stations"):

        # API Request
        station_information = wmata.get_station_information(station_code=station)

        # Metadata
        code = station
        name = station_information["Name"]
        lat = station_information["Lat"]
        lon = station_information["Lon"]
        station_information_dict = {
            "code": code,
            "name": name,
            "station_id": i,
            "lat": lat,
            "lon": lon,
        }

        # Add to dict for fare information later
        station_dict[code] = i

        # Write to CSV
        station_writer.writerow(station_information_dict)

        # Write to geojson
        geojson_dict["features"].append(
            {
                "type": "Feature",
                "properties": station_information_dict,
                "geometry": {
                    "coordinates": [lon, lat],
                    "type": "Point",
                },
            }
        )
        i += 1

    with open("geojson/stations.geojson", "w") as f:
        f.write(json.dumps(geojson_dict))

    # Loop through station pairs to get fare info
    for station_pair in tqdm(all_station_info, desc="Parsing Fare info"):
        src_station = station_pair["SourceStation"]
        dst_station = station_pair["DestinationStation"]
        peak = station_pair["RailFare"]["PeakTime"]
        off_peak = station_pair["RailFare"]["OffPeakTime"]
        senior_disabled = station_pair["RailFare"]["SeniorDisabled"]
        miles = station_pair["CompositeMiles"]

        fare_information_dict = {
            "src": station_dict[src_station],
            "dst": station_dict[dst_station],
            "peak": peak,
            "off_peak": off_peak,
            "senior_disabled": senior_disabled,
            "miles": miles,
        }

        # Write to CSV
        fare_writer.writerow(fare_information_dict)

    # Close csv files
    fare_csvfile.close()
    stations_csvfile.close()


if __name__ == "__main__":
    # Insert api_key
    api_key = ""
    main(api_key=api_key)
