import json

from sqlalchemy import and_
from sqlalchemy.orm import Session

from . import models, schemas


def get_all_stations(db: Session) -> list:
    stations = db.query(models.Station).all()
    return stations


def get_station_by_id(db: Session, station_id: int):
    station = (
        db.query(models.Station).filter(models.Station.station_id == station_id).first()
    )
    return station


def get_station_by_code(db: Session, code: str):
    station = db.query(models.Station).filter(models.Station.code == code).first()
    return station


def get_all_lines(db: Session) -> list:
    line = db.query(models.Line).all()
    return line


def get_line(db: Session, color: str):
    line = db.query(models.Line).filter(models.Line.color == color).first()

    return line


def get_fare_station_to_station(db: Session, src_station_id: int, dst_station_id: int):
    fare = (
        db.query(models.Fare)
        .filter(
            and_(models.Fare.src == src_station_id, models.Fare.dst == dst_station_id)
        )
        .all()[0]
    )
    return fare


def get_fares_from_station(db: Session, src_station_id: int) -> list:
    fares = db.query(models.Fare).filter(models.Fare.src == src_station_id).all()
    return fares


def stations_from_line_color(db: Session, color: str):
    match color:
        case "red":
            model = models.Red
        case "yellow":
            model = models.Yellow
        case "green":
            model = models.Green
        case "silver":
            model = models.Silver
        case "orange":
            model = models.Orange
        case "blue":
            model = models.Blue
    line_stations = db.query(model).all()
    stations = [station.station for station in line_stations]

    return stations
