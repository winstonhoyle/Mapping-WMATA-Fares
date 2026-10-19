import logging
import re

from . import data, fares, routes
from .responses import error, json_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

STATION_CODE = re.compile(r"^[A-Z]\d{2}$")


def _check(*codes: str) -> dict | None:
    if not all(STATION_CODE.match(c) for c in codes):
        return error(400, "Station codes are a letter and two digits, like A01")
    if any(fares.station(data.metro().stations, c) is None for c in codes):
        return error(404, "Station not found")
    return None


def _fares(code: str) -> dict:
    if bad := _check(code):
        return bad
    metro = data.metro()
    return json_response(200, fares.fares_from(fares.station(metro.stations, code), metro.fares))


def _route(origin: str, dest: str) -> dict:
    if bad := _check(origin, dest):
        return bad
    return json_response(200, routes.route(data.metro(), origin, dest))


def _dispatch(path: str) -> dict:
    if path == "/stations":
        return json_response(200, data.metro().stations)
    if path == "/lines":
        return json_response(200, data.metro().lines)
    parts = path.strip("/").split("/")
    if len(parts) == 2 and parts[0] == "fares":
        return _fares(parts[1].upper())
    if len(parts) == 3 and parts[0] == "route":
        return _route(parts[1].upper(), parts[2].upper())
    return error(404, "Not found")


def lambda_handler(event: dict, _context) -> dict:
    try:
        return _dispatch(event.get("rawPath", ""))
    except Exception:
        logger.exception("Request failed")
        return error(500, "Internal server error")
