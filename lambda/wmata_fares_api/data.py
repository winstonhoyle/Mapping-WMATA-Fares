import json
from dataclasses import dataclass
from functools import cache

import boto3

from . import config


@dataclass(frozen=True)
class Metro:
    stations: dict  # GeoJSON FeatureCollection
    lines: dict  # GeoJSON FeatureCollection
    fares: dict  # source code -> destination code -> fare


def _load(name: str) -> dict:
    obj = boto3.client("s3").get_object(Bucket=config.S3_BUCKET, Key=f"{config.S3_PREFIX}{name}")
    return json.loads(obj["Body"].read())


# Read once per Lambda container; the data changes only when data/upload_files.py runs.
@cache
def metro() -> Metro:
    return Metro(
        stations=_load("stations.geojson"),
        lines=_load("lines.geojson"),
        fares=_load("fares.json"),
    )
