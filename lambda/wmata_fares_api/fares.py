FREE = {"CompositeMiles": 0.0, "RailTime": 0, "PeakTime": 0.0, "OffPeakTime": 0.0, "SeniorDisabled": 0.0}


def station(stations: dict, code: str) -> dict | None:
    return next((f for f in stations["features"] if f["properties"]["Code"] == code), None)


def fares_from(origin: dict, fares: dict) -> dict:
    """Fares from the origin to every station. Its other platform (Metro Center A01/C01) is free."""
    code = origin["properties"]["Code"]
    free = {code, origin["properties"].get("StationTogether1") or code}
    return {**fares.get(code, {}), **{c: FREE for c in free}}
