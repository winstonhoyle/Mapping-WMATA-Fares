import io
import json
import os
from collections import defaultdict
from typing import Tuple, Union

import boto3
import geojson
import requests
from dotenv import load_dotenv

load_dotenv(".env")

WMATA_API_KEY = os.environ.get("WMATA_API_KEY")
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_PREFIX = os.environ.get("S3_PREFIX", "wmata/")

s3 = boto3.client("s3")


def upload_json(obj: Union[geojson.FeatureCollection, list, dict], key: str):
    """
    Upload a JSON-like object to S3 in memory
    """
    buf = io.BytesIO()
    if isinstance(obj, geojson.FeatureCollection):
        buf.write(geojson.dumps(obj).encode("utf-8"))
    else:
        buf.write(json.dumps(obj).encode("utf-8"))
    buf.seek(0)
    s3.upload_fileobj(buf, S3_BUCKET, key)


def extract_and_transform(api_key: str) -> Tuple[geojson.FeatureCollection, list, dict]:
    """
    Build 3 files: Fares JSON, Stations GeoJSON, and Lines GeoJSON
    """

    headers = {"api_key": api_key}

    ## Request all endpoints

    # Lines, they're already formatted
    resp = requests.get(
        "https://opendata.dc.gov/api/download/v1/items/ead6291a71874bf8ba332d135036fbda/geojson?layers=58",
        allow_redirects=False,
    )
    lines_geojson = requests.get(resp.headers["Location"]).json()

    # Stations
    stations_json = requests.get(
        "http://api.wmata.com/Rail.svc/json/jStations", headers=headers
    ).json()["Stations"]

    # Fares
    fares_json = requests.get(
        "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
        headers=headers,
    ).json()["StationToStationInfos"]

    ## Format Stations and Fares
    # Formatted dict to be {src_station: {destination_station: fare_dict}}
    formatted_fares = defaultdict(dict)

    # Loop through stations and get coordinates and properties
    features = []
    for s in stations_json:
        properties = s.copy()
        station_code = properties["Code"]
        lat = properties.pop("Lat")
        lon = properties.pop("Lon")

        # Create a Feature
        feature = geojson.Feature(
            geometry=geojson.Point((lon, lat)), properties=properties
        )
        features.append(feature)

        # Format fares
        for fare in fares_json:
            if fare["SourceStation"] == station_code:
                flat_entry = fare.copy()
                flat_entry.pop("SourceStation")
                destination_station = flat_entry.pop("DestinationStation")
                rail_fare = flat_entry.pop("RailFare")
                flat_entry.update(rail_fare)
                formatted_fares[station_code][destination_station] = flat_entry

    # Format into GeoJSON
    stations_geojson = geojson.FeatureCollection(features)

    return stations_geojson, formatted_fares, lines_geojson


def main():

    stations, fares, lines = extract_and_transform(api_key=WMATA_API_KEY)

    # S3 and Local output
    for file_name, data_obj in zip(
        ["stations.geojson", "fares.json", "lines.geojson"], [stations, fares, lines]
    ):

        # Write locally
        with open(os.path.join("data", file_name), "w") as f:
            f.write(json.dumps(stations))

        # Upload
        upload_json(data_obj, f"{S3_PREFIX}{file_name}")


if __name__ == "__main__":
    main()
