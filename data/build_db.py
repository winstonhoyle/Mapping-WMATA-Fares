import os
import glob
from dotenv import dotenv_values

from build_lines_meta_table import build_tables
from convert_geojson_to_gpkg import convert_geojson_to_gpkg
from make_station_files import make_station_tables

env = dotenv_values("../.env")
wmata_api_key = env['WMATA_API_KEY']

make_station_tables(api_key=wmata_api_key)
convert_geojson_to_gpkg()
build_tables(api_key=wmata_api_key)