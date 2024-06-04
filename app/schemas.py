from typing import Optional, List

from pydantic import BaseModel, ConfigDict


class StationBase(BaseModel):
    code: str
    name: str
    station_idx: int


class Station(StationBase):
    geojson: dict

class StationPair(BaseModel):
    src_station: Station
    dst_station: Station


class Fare(BaseModel):
    src: int
    dst: int
    peak: float
    off_peak: float
    senior_disabled: float


class StationFare(Fare, StationPair):
    pass


class DstStationFare(Fare):
    dst_station: Station


class FareList(BaseModel):
    src_station: Station
    fares: List[DstStationFare]
