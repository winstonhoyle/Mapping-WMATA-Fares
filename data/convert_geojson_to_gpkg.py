import geopandas


def main():

    # Open then write out in geopandas. can do in ogr2ogr but too much bloat install GDAL
    stations = geopandas.read_file("geojson/stations.geojson")
    stations.to_file("gpkg/stations.gpkg", driver="GPKG")
    lines = geopandas.read_file("geojson/lines.geojson")
    lines.to_file("gpkg/lines.gpkg", driver="GPKG")


if __name__ == "__main__":
    main()
