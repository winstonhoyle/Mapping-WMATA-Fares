import requests


class WMATA:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            # Request headers
            "api_key": self.api_key,
        }

    def get_lines(self) -> list:

        response = requests.get(
            "https://api.wmata.com/Rail.svc/json/jLines", headers=self.headers
        )
        return response.json()["Lines"]

    def get_line(self, line_color: str) -> list:

        response = requests.get(
            f"https://api.wmata.com/Rail.svc/json/jStations?LineCode={line_color}",
            headers=self.headers,
        )
        return response.json()["Stations"]

    def get_all_station_information(self) -> list:

        response = requests.get(
            "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
            headers=self.headers,
        )
        return response.json()["StationToStationInfos"]

    def get_station_information(self, station_code: str) -> dict:

        params = {"StationCode": station_code}
        response = requests.get(
            "https://api.wmata.com/Rail.svc/json/jStationInfo",
            params=params,
            headers=self.headers,
        )
        return response.json()

    def get_station_to_station_information(
        self, src_station: str, dest_station: str
    ) -> dict:

        params = {"FromStationCode": src_station, "ToStationCode": dest_station}
        response = requests.get(
            "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
            params=params,
            headers=self.headers,
        )
        return response.json()
