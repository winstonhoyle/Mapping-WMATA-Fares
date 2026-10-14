import pytest
from wmata_fares_api import data


def feature(code: str, name: str, together: str = "") -> dict:
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [-77.0, 38.9]},
        "properties": {"Code": code, "Name": name, "StationTogether1": together},
    }


def fare(peak: float) -> dict:
    return {"CompositeMiles": 1.0, "RailTime": 2, "PeakTime": peak, "OffPeakTime": peak, "SeniorDisabled": 1.1}


METRO = data.Metro(
    stations={
        "type": "FeatureCollection",
        "features": [
            feature("A01", "Metro Center", "C01"),
            feature("C01", "Metro Center", "A01"),
            feature("A02", "Farragut North"),
        ],
    },
    lines={"type": "FeatureCollection", "features": []},
    fares={
        "A01": {"C01": fare(2.0), "A02": fare(2.25)},
        "A02": {"A01": fare(2.25), "C01": fare(2.25)},
    },
)


@pytest.fixture(autouse=True)
def fake_metro(monkeypatch):
    monkeypatch.setattr(data, "metro", lambda: METRO)


def event(path: str) -> dict:
    return {"version": "2.0", "rawPath": path, "requestContext": {"http": {"method": "GET", "path": path}}}
