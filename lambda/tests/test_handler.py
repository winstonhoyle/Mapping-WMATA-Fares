import json

from conftest import event
from wmata_fares_api import data
from wmata_fares_api.handler import lambda_handler


def call(path: str) -> tuple[int, dict, dict]:
    res = lambda_handler(event(path), None)
    return res["statusCode"], json.loads(res["body"]), res["headers"]


def test_stations_and_lines_are_cacheable_geojson():
    for path in ("/stations", "/lines"):
        status, body, headers = call(path)
        assert status == 200
        assert body["type"] == "FeatureCollection"
        assert headers["Cache-Control"].startswith("public")
        assert headers["Access-Control-Allow-Origin"] == "*"


def test_fares_make_the_origin_and_its_other_platform_free():
    status, body, _ = call("/fares/A01")
    assert status == 200
    assert body["A01"]["PeakTime"] == 0
    assert body["C01"]["PeakTime"] == 0
    assert body["A02"]["PeakTime"] == 2.25


def test_fares_accept_lowercase_codes():
    assert call("/fares/a02")[0] == 200


def test_fares_do_not_change_the_loaded_data():
    call("/fares/A01")
    assert "A01" not in data.metro().fares["A01"]


def test_bad_and_unknown_codes():
    status, _, headers = call("/fares/../etc")
    assert status in (400, 404)
    assert headers["Cache-Control"] == "no-store"
    assert call("/fares/ZZZ")[0] == 400
    assert call("/fares/Z99")[0] == 404


def test_unknown_path():
    assert call("/station")[0] == 404


def test_errors_are_500_without_details(monkeypatch):
    def boom():
        raise RuntimeError("secret")

    monkeypatch.setattr(data, "metro", boom)
    status, body, _ = call("/stations")
    assert status == 500
    assert "secret" not in body["error"]


def test_route_validates_both_codes():
    status, body, headers = call("/route/a01/A02")
    assert status == 200
    assert isinstance(body, list)
    assert headers["Cache-Control"].startswith("public")
    assert call("/route/A01/ZZZ")[0] == 400
    assert call("/route/Z99/A01")[0] == 404
