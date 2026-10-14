import logging
import re

from . import data, fares
from .responses import error, json_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

STATION_CODE = re.compile(r"^[A-Z]\d{2}$")


def _fares(code: str) -> dict:
    if not STATION_CODE.match(code):
        return error(400, "Station codes are a letter and two digits, like A01")
    metro = data.metro()
    origin = fares.station(metro.stations, code)
    if origin is None:
        return error(404, "Station not found")
    return json_response(200, fares.fares_from(origin, metro.fares))


def _route(path: str) -> dict:
    if path == "/stations":
        return json_response(200, data.metro().stations)
    if path == "/lines":
        return json_response(200, data.metro().lines)
    parts = path.strip("/").split("/")
    if len(parts) == 2 and parts[0] == "fares":
        return _fares(parts[1].upper())
    return error(404, "Not found")


def lambda_handler(event: dict, _context) -> dict:
    try:
        return _route(event.get("rawPath", ""))
    except Exception:
        logger.exception("Request failed")
        return error(500, "Internal server error")
