from wmata_fares_api import data
from wmata_fares_api.routes import line_orders, route


def station(code: str, lines: list[str], together: str = "") -> dict:
    props = {"Code": code, "Name": code, "StationTogether1": together}
    props.update({f"LineCode{i + 1}": line for i, line in enumerate(lines)})
    return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [0, 0]}, "properties": props}


def network(stops: dict[str, tuple[list[str], str, float]]) -> data.Metro:
    """Stations at positions along a track; a trip's time is the gap, with no shortcuts."""
    fares = {
        a: {b: {"RailTime": round(abs(pa - pb)), "CompositeMiles": abs(pa - pb)} for b, (_, _, pb) in stops.items() if b != a}
        for a, (_, _, pa) in stops.items()
    }
    features = [station(code, lines, together) for code, (lines, together, _) in stops.items()]
    return data.Metro(stations={"features": features}, lines={}, fares=fares)


# Red runs A1-A2-A3; Blue runs B1-B2-B3; A2 and B2 are one station with two platform codes.
METRO = network(
    {
        "A1": (["RD"], "", 0),
        "A2": (["RD"], "B2", 2),
        "A3": (["RD"], "", 4),
        "B1": (["BL"], "", 1),
        "B2": (["BL"], "A2", 2),
        "B3": (["BL"], "", 3),
    }
)


def test_orders_each_line_end_to_end():
    orders = line_orders(METRO)
    assert orders["RD"] in (["A1", "A2", "A3"], ["A3", "A2", "A1"])
    assert orders["BL"] in (["B1", "B2", "B3"], ["B3", "B2", "B1"])


def test_one_line_trip_is_one_leg_toward_the_end():
    assert route(METRO, "A1", "A3") == [
        {"stations": ["A1", "A2", "A3"], "lines": [{"line": "RD", "toward": "A3"}]}
    ]


def test_changes_lines_at_the_shared_station():
    legs = route(METRO, "A1", "B3")
    assert [leg["stations"] for leg in legs] == [["A1", "A2"], ["B2", "B3"]]
    assert [leg["lines"][0]["line"] for leg in legs] == ["RD", "BL"]


def test_same_station_needs_no_ride():
    assert route(METRO, "A2", "B2") == []
