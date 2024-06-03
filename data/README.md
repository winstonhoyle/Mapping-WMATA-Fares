## Folder Structure
* `csv/` has no use except for hosting then loading the tables into `lines.gpkg`
* `geojson/` is where the GIS data from [DC GIS Portal](https://opendata.dc.gov/datasets/metro-lines-regional/about). 
* `gpkg/` is where the main [GeoPackage](https://www.geopackage.org/) is located. `stations.gpkg` is also created but this is for development and visual purposes. `gpkg/lines.gpkg` will be the data the web application pulls from. Other tables like stations, fares, and colored loines will be located.

## Mapping-WMATA-Fares Python API
Within [wmata.py](https://github.com/winstonhoyle/Mapping-WMATA-Fares/tree/main/data/wmata.py) are the functions to retrieve data from the [WMATA API](https://developer.wmata.com/). This API is very lightweight. To do more complex python work please refer to [pywmata](https://github.com/emma-k-alexandra/pywmata).

## Notes
* Are folders that include data. GeoJSON data is from [DC GIS Portal](https://opendata.dc.gov/datasets/metro-lines-regional/about).
* To create this data you need a API Token from [WMATA API](https://developer.wmata.com/)
* Script [convert_geojson_to_gpkg.py](https://github.com/winstonhoyle/Mapping-WMATA-Fares/tree/main/data/convert_geojson_to_gpkg.py) will convert the `geojson/*.geojson` files into `gpkg/*.gpkg`
* Script [make_station_files.py](https://github.com/winstonhoyle/Mapping-WMATA-Fares/tree/main/data/make_station_files.py) will build `csv/stations.csv` and `csv/fares.csv`
* Script [build_lines_meta_table.py](https://github.com/winstonhoyle/Mapping-WMATA-Fares/tree/main/data/build_lines_meta_table.py) will build the `lines` and `stations` tables within `lines.gpkg` which houses names and lat/lon for stations. The `fares` table will also be created.
* If you create the data please do it in this order from the `Notes` section.

