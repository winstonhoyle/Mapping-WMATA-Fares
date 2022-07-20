import json

"""
from azure.storage.blob import BlobServiceClient
from azure.batch import BatchServiceClient
from azure.batch.batch_auth import SharedKeyCredentials
import azure.batch.models as batchmodels
from azure.core.exceptions import ResourceExistsError
"""

from config import Config

config = Config(".env")

with open("data/metro_stations.geojson", "r") as f:
    stations_dict = json.load(f)

station_names = [feature['properties']['NAME'] for feature in stations_dict['features']]

