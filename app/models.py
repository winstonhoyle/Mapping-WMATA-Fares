import json

from enum import Enum
from typing import List

from geoalchemy2 import Geometry, WKBElement
from geojson import Point
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, reconstructor
from sqlalchemy.ext.declarative import AbstractConcreteBase, declared_attr


from pydantic import BaseModel

from .database import Base


class Station(Base):
    __tablename__ = "stations"

    station_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = Column(unique=True)
    name: Mapped[str] = Column(unique=True)
    lat: Mapped[float]
    lon: Mapped[float]

    @reconstructor
    def init_on_load(self):
        point = Point((self.lon, self.lat))
        self.geojson = point


class Fare(Base):
    __tablename__ = "fares"
    fare_id: Mapped[int] = Column(primary_key=True)
    src: Mapped[int] = mapped_column(
        Integer, ForeignKey("stations.station_id"), index=True
    )
    dst: Mapped[int] = mapped_column(
        Integer, ForeignKey("stations.station_id"), index=True
    )
    peak: Mapped[float]
    off_peak: Mapped[float]
    senior_disabled: Mapped[float]
    src_station = relationship("Station", foreign_keys=[src])
    dst_station = relationship("Station", foreign_keys=[dst])


class Line(Base):
    __tablename__ = "lines"
    fid: Mapped[int] = Column(primary_key=True)
    name: Mapped[str]
    color: Mapped[str]
    color_id: Mapped[int] = Column(index=True)
    geom: Mapped[WKBElement] = Column(Geometry(geometry_type="LINESTRING"))


class LineStations(AbstractConcreteBase, Base):
    station_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("stations.station_id"), primary_key=True
    )

    @declared_attr
    def station(cls):
        return relationship("Station")


class Red(LineStations):
    __tablename__ = "red"


class Yellow(LineStations):
    __tablename__ = "yellow"


class Green(LineStations):
    __tablename__ = "green"


class Orange(LineStations):
    __tablename__ = "orange"


class Silver(LineStations):
    __tablename__ = "silver"


class Blue(LineStations):
    __tablename__ = "blue"


class StationColorNames(str, Enum):
    ALL = "all"
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"
    ORANGE = "orange"
    SILVER = "silver"
    BLUE = "blue"


class StationColors(str, Enum):
    RD = "RD"
    YL = "YL"
    GR = "GR"
    OR = "OR"
    SV = "SV"
    BL = "BL"
