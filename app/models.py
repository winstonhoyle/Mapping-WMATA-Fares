from sqlalchemy import Column, Float, Integer, String

from .database import Base


class Station(Base):
    __tablename__ = 'stations'

    station_idx = Column(Integer, index=True, primary_key=True)
    code = Column(String, unique=True)
    name = Column(String, unique=True)
    lat = Column(Float)
    lon = Column(Float)


class Fare(Base):
    __tablename__ = 'fares'
    fare_idx = Column(Integer, primary_key=True)
    src = Column(Integer, index=True)
    dst = Column(Integer, index=True)
    peak = Column(Float)
    off_peak = Column(Float)
    senior_disabled = Column(Float)
    miles = Column(Float)
