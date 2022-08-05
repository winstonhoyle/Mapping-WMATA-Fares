from requests import Response, get
from datetime import datetime

# Station object use here and REST API
class Station(object):
    def __init__(self, id: int, name: str, coordinates: list):
        self.id = id
        self.name = name
        self.coords = coordinates


class Fare(object):
    def __init__(self, peak: float, offpeak: float, reduced: float):
        self.peak = peak
        self.offpeak = offpeak
        self.reduced = reduced


peak_time = datetime(2022, 9, 1, 8, 30, 0)

# Comparison object, get fares between two stations
class StationPair(object):
    def __init__(
        self, arrival_station: Station, departure_station: Station, time: datetime = peak_time
    ):
        self.arrival_station = arrival_station
        self.departure_station = departure_station
        # See what stations are closed at this date, ensure it's a weekday
        if time.hour < 12:
            time_of_day = 'AM'
        else:
            time_of_day = 'PM'
        self._peak_params = {
            'location': self.arrival_station.name,
            'destination': self.departure_station.name,
            'travelby': 'CLR',
            'arrdep': 'D',
            'hour-leaving': str(time.hour),
            'minute-leaving': str(time.minute),
            'day-leaving': str(time.day),
            'walk-distance': '0.25',
            'month-leaving': str(time.month),
            'period-leaving': time_of_day,
            'route': 'W',
            'locationlatlong': self.arrival_station.coords,
            'destinationlatlong': self.departure_station.coords,
        }
        self._offpeak_params = self._get_offpeak_params()

    def _get_offpeak_params(self) -> dict:
        offpeak_params = self._peak_params.copy()
        offpeak_params['hour-leaving'] = '12'
        offpeak_params['period-leaving'] = 'PM'
        return offpeak_params

    def set_fare(self, fare: Fare):
        self.fare = fare

    # Set fare, reusing code for peak/offpeak
    def get_fare(self):
        """Returns fare object

        This function is creation of fare object from station pairs, also used in update scripts later
        as stations get added or current stations down indefinitely come back. 
        """
        # Peak request
        resp = self._format_request(self._peak_params)
        resp_dict = resp.json()
        try:
            peak = resp_dict['Response']['Plantrip']['Plantrip1']['Itin']['Regularfare']
            reduced = resp_dict['Response']['Plantrip']['Plantrip1']['Itin']['Reducedfare']
        except KeyError:
            print(
                f'Peak Error: {self.departure_station.name} ({self.departure_station.coords}) to {self.arrival_station.name} ({self.arrival_station.coords})'
            )
            peak = 0.0
            reduced = 0.0

        # Offpeak request
        resp = self._format_request(self._offpeak_params)
        resp_dict = resp.json()
        try:
            offpeak = resp_dict['Response']['Plantrip']['Plantrip1']['Itin']['Regularfare']
        except KeyError:
            print(
                f'Offpeak Error: {self.departure_station.name} ({self.departure_station.coords}) to {self.arrival_station.name} ({self.arrival_station.coords})'
            )
            offpeak = 0.0
        return Fare(peak, offpeak, reduced)

    # Internal function to request wmata trip planner but removes latlong if it causes problems
    # tripPlanner is not a good API so popping latlong helps
    def _format_request(self, params) -> Response:
        url = 'https://www.wmata.com/node/wmata/wmataAPI/tripPlanner'
        print("we got here")
        import json
        print(json.dumps(params))
        resp = get(url, params=params)
        print("nop")
        if 'Response' in resp.json():
            return resp
        else:
            params.pop('locationlatlong')
            params.pop('destinationlatlong')
            resp = get(url, params=params)
        return resp
