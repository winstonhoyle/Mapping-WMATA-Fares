import json
from typing import List, Optional, Union

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from geoalchemy2.shape import to_shape
from geojson import FeatureCollection, Feature, Point, LineString
from shapely import to_geojson
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static", html=True), name="static")


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get(
    "/station",
    response_model=Union[schemas.Station, dict],
    description="Returns station",
)
async def read_station(
    code: Optional[str] = None,
    station_id: Optional[int] = None,
    geojson: Optional[bool] = False,
    db: Session = Depends(get_db),
):

    if code and station_id:
        raise HTTPException(
            status_code=400,
            detail="Please query station by code or ID",
            headers={"X-Error": "TParameter Error"},
        )

    if station_id:
        if station_id < 1 or station_id > 102:
            raise HTTPException(
                status_code=400,
                detail="Please query station by code or ID",
                headers={"X-Error": "TParameter Error"},
            )

    # Valid station IDs are 1-102
    if station_id and (
        (station_id < 1 or station_id < 1) or (station_id > 102 or station_id > 102)
    ):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid station id",
            headers={"X-Error": "TParameter Error"},
        )

    if station_id:
        station = crud.get_station_by_id(db, station_id=station_id)
    if code:
        station = crud.get_station_by_code(db, code=code)

    if not geojson:
        return station
    else:
        point = Point(station.geojson["coordinates"])
        feature = Feature(
            geometry=point,
            properties={"name": station.name, "code": station.code},
        )

        # Create Feature collection
        feature_collection = FeatureCollection([feature])
        return feature_collection


@app.get(
    "/stations",
    response_model=Union[List[schemas.Station], dict],
    description="Returns all stations",
)
async def read_all_stations(
    line: models.StationColorNames,
    geojson: Optional[bool] = False,
    db: Session = Depends(get_db),
):

    if line == models.StationColorNames.ALL:
        stations = crud.get_all_stations(db)
    else:
        stations = crud.stations_from_line_color(db, color=line)

    if not geojson:
        return stations
    else:
        features = []
        for station in stations:
            point = Point(station.geojson["coordinates"])
            feature = Feature(
                geometry=point,
                properties={"name": station.name, "code": station.code},
            )
            features.append(feature)

        feature_collection = FeatureCollection(features)
        return feature_collection


@app.get("/lines", response_model=dict, description="Returns Line")
async def read_all_lines(db: Session = Depends(get_db)):
    lines = crud.get_all_lines(db)

    features = []

    for line in lines:

        # Convert geom object to geojson
        linestring = to_shape(line.geom)
        geojson_obj = to_geojson(linestring)
        geojson_validated = json.loads(geojson_obj)
        linestring_obj = LineString(geojson_validated["coordinates"])
        feature = Feature(
            geometry=linestring_obj, properties={"color": line.color, "name": line.name}
        )
        features.append(feature)

    # Create Feature collection
    feature_collection = FeatureCollection(features)
    return feature_collection


@app.get("/line/{color}", response_model=dict, description="Returns line")
async def read_line(color: models.StationColors, db: Session = Depends(get_db)):
    line = crud.get_line(db, color=color)

    # Convert geom object to geojson
    linestring = to_shape(line.geom)
    geojson_obj = to_geojson(linestring)
    geojson_validated = json.loads(geojson_obj)
    linestring_obj = LineString(geojson_validated["coordinates"])

    # Create geojson line string obj
    feature = Feature(
        geometry=linestring_obj, properties={"color": line.color, "name": line.name}
    )

    # Create Feature collection
    feature_collection = FeatureCollection([feature])
    return feature_collection


@app.get(
    "/fare",
    response_model=Union[schemas.StationFare, dict],
    description="Gets fare from one station to another",
)
async def read_fare(
    src_station_id: int,
    dst_station_id: int,
    geojson: Optional[bool] = False,
    db: Session = Depends(get_db),
):
    # Valid station IDs are 1-102
    if (src_station_id < 1 or src_station_id < 1) or (
        src_station_id > 102 or dst_station_id > 102
    ):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid station id",
            headers={"X-Error": "TParameter Error"},
        )

    fare = crud.get_fare_station_to_station(
        db, src_station_id=src_station_id, dst_station_id=dst_station_id
    )

    # Standard API return
    if not geojson:
        return fare
    else:

        # Build src feature object
        src_station_point = Point(fare.src_station.geojson["coordinates"])
        src_station_feature = Feature(
            geometry=src_station_point,
            properties={
                "station_id": fare.src_station.station_id,
                "name": fare.src_station.name,
                "peak": 2,
                "off_peak": 2,
                "senior_disabled": 1,
            },
        )

        # Build dst feature object
        dst_station_point = Point(fare.dst_station.geojson["coordinates"])
        dst_station_feature = Feature(
            geometry=dst_station_point,
            properties={
                "station_id": fare.dst_station.station_id,
                "name": fare.dst_station.name,
                "peak": fare.peak,
                "off_peak": fare.off_peak,
                "senior_disabled": fare.senior_disabled,
            },
        )

        # Create Feature collection
        feature_collection = FeatureCollection(
            [src_station_feature, dst_station_feature]
        )
        return feature_collection


@app.get(
    "/fare/{station_id}",
    response_model=Union[schemas.FareList, dict],
    description="Returns all fares for this station",
)
async def read_fares(
    station_id: int,
    geojson: Optional[bool] = False,
    color: Optional[models.StationColorNames] = None,
    db: Session = Depends(get_db),
):

    if color:

        # Get fares only on the line
        check = crud.check_station_on_line(db, station_id=station_id, color=color)
        if not check:
            raise HTTPException(
                status_code=400,
                detail="Station is not on the line",
                headers={"X-Error": "TParameter Error"},
            )

        fares = crud.get_station_fares_by_line(
            db, src_station_id=station_id, color=color
        )
        src_station = fares[0].src_station

    else:

        # Get all fares
        fares = crud.get_fares_from_station(db, src_station_id=station_id)
        src_station = fares[0].src_station

    # Standard API return
    if not geojson:
        return {"src_station": src_station, "fares": fares}
    else:

        # Build features and feature collection
        features = []

        # Build src feature object
        src_station_point = Point(src_station.geojson["coordinates"])
        src_station_feature = Feature(
            geometry=src_station_point,
            properties={
                "station_id": station_id,
                "code": src_station.code,
                "name": src_station.name,
                "peak": 2,
                "off_peak": 2,
                "senior_disabled": 1,
            },
        )
        features.append(src_station_feature)

        # Loop through all the destination stations and build geojson objects
        for fare in fares:
            point = Point(fare.dst_station.geojson["coordinates"])
            feature = Feature(
                geometry=point,
                properties={
                    "station_id": fare.dst,
                    "code": fare.dst_station.code,
                    "name": fare.dst_station.name,
                    "peak": fare.peak,
                    "off_peak": fare.off_peak,
                    "senior_disabled": fare.senior_disabled,
                },
            )
            features.append(feature)

        # Create Feature collection
        feature_collection = FeatureCollection(features)
        return feature_collection
