import os

S3_BUCKET = os.environ.get("S3_BUCKET", "wmata-fares")
S3_PREFIX = os.environ.get("S3_PREFIX", "data/")
