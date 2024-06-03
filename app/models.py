from enum import Enum

from sqlalchemy import Column
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry, WKBElement

from .database import Base


class Station(Base):
    __tablename__ = 'stations'

    station_idx: Mapped[int] = Column(primary_key=True)
    code: Mapped[str] = Column(unique=True)
    name: Mapped[str] = Column(unique=True)
    lat: Mapped[float]  # = Column()
    lon: Mapped[float]  # = Column()


class Fare(Base):
    __tablename__ = 'fares'
    fare_idx: Mapped[int] = Column(primary_key=True)
    src: Mapped[int] = Column(index=True)
    dst: Mapped[int] = Column(index=True)
    peak: Mapped[float]
    off_peak: Mapped[float]
    senior_disabled: Mapped[float]
    miles: Mapped[float]


class Line(Base):
    __tablename__ = 'lines'
    fid: Mapped[int] = Column(primary_key=True)
    name: Mapped[str]
    color: Mapped[str]
    color_idx: Mapped[int] = Column(index=True)
    geom = Column(Geometry('GEOMETRY'))


class StationColors(str, Enum):
    RD = 'RD'
    YL = 'YL'
    GR = 'GR'
    OR = 'OR'
    SV = 'SV'
    BL = 'BL'
