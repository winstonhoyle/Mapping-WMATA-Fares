import csv
import json
import os
import tempfile

import boto3
import pandas as pd
import requests

WMATA_API_KEY = os.environ.get("WMATA_API_KEY")
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_PREFIX = os.environ.get("S3_PREFIX", "wmata/")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

s3 = boto3.client("s3", region_name=AWS_REGION)
secrets_client = boto3.client("secretsmanager", region_name=AWS_REGION)


# ========= Internal WMATA API ==========
class WMATA:
    def __init__(self, api_key: str):
        self.headers = {"api_key": api_key}

    def get_lines(self):
        return requests.get(
            "https://api.wmata.com/Rail.svc/json/jLines", headers=self.headers
        ).json()["Lines"]

    def get_line(self, line_color: str):
        return requests.get(
            f"https://api.wmata.com/Rail.svc/json/jStations?LineCode={line_color}",
            headers=self.headers,
        ).json()["Stations"]

    def get_all_station_information(self):
        return requests.get(
            "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
            headers=self.headers,
        ).json()["StationToStationInfos"]

    def get_station_information(self, station_code: str):
        return requests.get(
            "https://api.wmata.com/Rail.svc/json/jStationInfo",
            params={"StationCode": station_code},
            headers=self.headers,
        ).json()


# ========= ETL FUNCTIONS ==========
def extract_and_transform_stations(wmata):
    """
    Fetch all stations and fares, return CSV and GeoJSON paths.
    """
    stations_csv = tempfile.NamedTemporaryFile(delete=False, suffix=".csv").name
    fares_csv = tempfile.NamedTemporaryFile(delete=False, suffix=".csv").name
    stations_geojson = tempfile.NamedTemporaryFile(delete=False, suffix=".geojson").name

    # Prepare CSV writers
    station_writer = csv.DictWriter(
        open(stations_csv, "w", newline=""),
        fieldnames=["code", "name", "station_id", "lat", "lon"],
    )
    station_writer.writeheader()
    fare_writer = csv.DictWriter(
        open(fares_csv, "w", newline=""),
        fieldnames=["src", "dst", "peak", "off_peak", "senior_disabled", "miles"],
    )
    fare_writer.writeheader()

    geojson_dict = {"type": "FeatureCollection", "features": []}
    station_dict = {}

    all_station_info = wmata.get_all_station_information()
    stations = list(set([s["SourceStation"] for s in all_station_info]))

    # Build stations
    for i, code in enumerate(stations, desc="Stations"):
        info = wmata.get_station_information(code)
        station_id = i + 1
        station_dict[code] = station_id
        row = {
            "code": code,
            "name": info["Name"],
            "station_id": station_id,
            "lat": info["Lat"],
            "lon": info["Lon"],
        }
        station_writer.writerow(row)
        geojson_dict["features"].append(
            {
                "type": "Feature",
                "properties": row,
                "geometry": {
                    "type": "Point",
                    "coordinates": [info["Lon"], info["Lat"]],
                },
            }
        )

    # Build fares
    for s in all_station_info:
        fare_writer.writerow(
            {
                "src": station_dict[s["SourceStation"]],
                "dst": station_dict[s["DestinationStation"]],
                "peak": s["RailFare"]["PeakTime"],
                "off_peak": s["RailFare"]["OffPeakTime"],
                "senior_disabled": s["RailFare"]["SeniorDisabled"],
                "miles": s["CompositeMiles"],
            }
        )

    # Write GeoJSON
    with open(stations_geojson, "w") as f:
        json.dump(geojson_dict, f)

    return stations_csv, fares_csv, stations_geojson


def build_lines_csv(wmata, stations_csv):
    df_stations = pd.read_csv(stations_csv)
    lines_csv = tempfile.NamedTemporaryFile(delete=False, suffix=".csv").name
    data = []
    for line in wmata.get_lines():
        line_stations = wmata.get_line(line["Code"])
        for s in line_stations:
            station_id = df_stations[df_stations["code"] == s["Code"]][
                "station_id"
            ].values[0]
            data.append({"line": line["Name"], "station_id": station_id})
    pd.DataFrame(data).to_csv(lines_csv, index=False)
    return lines_csv


# ========= MAIN ==========
def main():

    wmata = WMATA(api_key=WMATA_API_KEY)

    stations_csv, fares_csv, stations_geojson = extract_and_transform_stations(wmata)
    lines_csv = build_lines_csv(wmata, stations_csv)

    # Upload to S3
    for file_path in [stations_csv, fares_csv, stations_geojson, lines_csv]:
        key = f"{S3_PREFIX}{os.path.basename(file_path)}"
        s3.upload_file(file_path, S3_BUCKET, key)


if __name__ == "__main__":
    main()
