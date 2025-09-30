import json
import os
from typing import Optional

import boto3

S3_BUCKET = os.environ.get("S3_BUCKET")
S3_PREFIX = os.environ.get("S3_PREFIX", "wmata-fares/data/")

STATIONS_FILE = f"{S3_PREFIX}stations.geojson"
FARES_FILE = f"{S3_PREFIX}fares.json"
LINES_FILE = f"{S3_PREFIX}lines.geojson"

s3 = boto3.client("s3")


def load_file(key: str) -> dict:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    data = obj["Body"].read().decode("utf-8")
    return json.loads(data)


STATIONS_GEOJSON = load_file(STATIONS_FILE)
LINES_GEOJSON = load_file(LINES_FILE)
FARES_JSON = load_file(FARES_FILE)


def get_station_by_code(station_id: str) -> Optional[dict]:
    station = next(
        (
            f
            for f in STATIONS_GEOJSON["features"]
            if f["properties"]["Code"] == station_id
        ),
        None,
    )
    return station


def lambda_handler(event, context) -> dict:
    path = event.get("rawPath", "/")
    query = event.get("queryStringParameters") or {}

    try:
        if path == "/stations":
            return {
                "statusCode": 200,
                "body": json.dumps(STATIONS_GEOJSON),
                "headers": {"Content-Type": "application/json"},
            }

        elif path == "/lines":
            return {
                "statusCode": 200,
                "body": json.dumps(LINES_GEOJSON),
                "headers": {"Content-Type": "application/json"},
            }

        elif path == "/station":
            code = query.get("code")
            if not code:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Missing station code"}),
                }
            station = get_station_by_code(code)
            if not station:
                return {
                    "statusCode": 422,
                    "body": json.dumps({"error": "Station Not Found"}),
                }
            else:
                return {
                    "statusCode": 200,
                    "body": json.dumps(station),
                    "headers": {"Content-Type": "application/json"},
                }

        elif path.startswith("/fares/"):

            src_id = path.split("/")[-1]

            # Get ID
            station = get_station_by_code(src_id)
            if not station:
                return {
                    "statusCode": 422,
                    "body": json.dumps({"error": "Station Not Found"}),
                }

            # Copy so we are not changing
            selected_stations_geojson = STATIONS_GEOJSON.copy()

            # Get fares from source station
            selected_fares = FARES_JSON.get(src_id)

            # Loop through all stations and assign the fare and distance information
            for selected_station in selected_stations_geojson["features"]:
                dst_code = selected_station["properties"]["Code"]

                # If they equal, input empty dict
                if src_id == dst_code:
                    selected_station["properties"].update(
                        {
                            "CompositeMiles": 0.0,
                            "RailTime": 0,
                            "PeakTime": 0.0,
                            "OffPeakTime": 0.0,
                            "SeniorDisabled": 0.0,
                        }
                    )
                else:
                    selected_station["properties"].update(selected_fares[dst_code])

            return {
                "statusCode": 200,
                "body": json.dumps(selected_stations_geojson),
                "headers": {"Content-Type": "application/json"},
            }

        return {"statusCode": 404, "body": json.dumps({"error": "Endpoint not found"})}

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
