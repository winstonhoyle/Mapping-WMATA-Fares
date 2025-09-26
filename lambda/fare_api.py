import json
import os

import boto3
import geopandas as gpd
import pandas as pd
from shapely.geometry import mapping

S3_BUCKET = os.environ.get("S3_BUCKET")
S3_PREFIX = os.environ.get("S3_PREFIX", "wmata-fares/data/")

STATIONS_FILE = f"{S3_PREFIX}stations.gpkg"
LINES_FILE = f"{S3_PREFIX}lines.gpkg"
FARES_FILE = f"{S3_PREFIX}fares.csv"

s3 = boto3.client("s3")


def load_stations() -> gpd.GeoDataFrame:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=STATIONS_FILE)
    return gpd.read_file(obj["Body"], crs=4326)


def load_lines() -> gpd.GeoDataFrame:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=LINES_FILE)
    return gpd.read_file(obj["Body"], crs=4326)


def load_fares() -> pd.DataFrame:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=FARES_FILE)
    return pd.read_csv(obj["Body"])


STATIONS_GDF = load_stations()
LINES_GDF = load_lines()
FARES_DF = load_fares()


def get_station_by_code(code: str):
    row = STATIONS_GDF[STATIONS_GDF["code"] == code]
    return row.iloc[0].to_dict() if not row.empty else None


def get_fares_from_station(station_id: str):
    return FARES_DF[FARES_DF["src"] == station_id].to_dict(orient="records")


def lambda_handler(event, context) -> dict:
    path = event.get("path", "")
    query = event.get("queryStringParameters") or {}

    try:
        if path == "/stations":
            return {
                "statusCode": 200,
                "body": json.dumps(json.loads(STATIONS_GDF.to_json())),
                "headers": {"Content-Type": "application/json"},
            }

        elif path == "/lines":
            return {
                "statusCode": 200,
                "body": json.dumps(LINES_GDF.to_dict(orient="records")),
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
            return {
                "statusCode": 200,
                "body": json.dumps(station),
                "headers": {"Content-Type": "application/json"},
            }

        elif path.startswith("/fare/"):
            station_id = int(path.split("/")[-1])
            fares = get_fares_from_station(station_id)
            if query.get("geojson") == "true":
                features = []
                for f in fares:
                    dest = STATIONS_GDF[STATIONS_GDF["station_id"] == f["dst"]].iloc[0]
                    prop = f.copy()
                    prop["name"] = dest["name"]
                    features.append(
                        {
                            "type": "Feature",
                            "properties": prop,
                            "geometry": mapping(dest["geometry"]),
                        }
                    )
                return {
                    "statusCode": 200,
                    "body": json.dumps(
                        {"type": "FeatureCollection", "features": features}
                    ),
                    "headers": {"Content-Type": "application/json"},
                }
            return {
                "statusCode": 200,
                "body": json.dumps(fares),
                "headers": {"Content-Type": "application/json"},
            }

        elif path.startswith("/fares/"):
            station_id = int(path.split("/")[-1])
            return {
                "statusCode": 200,
                "body": json.dumps(get_fares_from_station(station_id)),
                "headers": {"Content-Type": "application/json"},
            }

        return {"statusCode": 404, "body": json.dumps({"error": "Endpoint not found"})}

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
