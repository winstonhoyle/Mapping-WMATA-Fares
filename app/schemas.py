from pydantic import BaseModel


class Fare(BaseModel):
    src: int
    dst: int
    peak: float
    off_peak: float
    senior_disabled: float
    miles: float


class Station(BaseModel):
    code: str
    name: str
    station_idx: int
    lat: float
    lon: float
