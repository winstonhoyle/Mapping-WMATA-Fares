import os
import sqlite3


class Database(object):
    def __init__(self, file_name: str, create_tables=False):

        # If file exists remove
        if create_tables and os.path.isfile(file_name):
            os.remove(file_name)

        # Create sqlite file
        self.conn = sqlite3.connect(file_name)
        self.cursor = self.conn.cursor()

        # Creating tables for processing this isn't triggered in REST API
        if create_tables:
            self._create_stations_table()
            self._create_fares_table()
            self.conn.commit()

    def _create_stations_table(self):
        sql = """
        CREATE TABLE stations (
            sid int PRIMARY KEY,
            station TEXT,
            coordinates TEXT
        );
        """
        self.cursor.execute(sql)

    def _create_fares_table(self):
        sql = """
        CREATE TABLE fares (
            dept TEXT,
            arr TEXT,
            peak REAL,
            offpeak REAL,
            reduced REAL
        );
        """
        self.cursor.execute(sql)

    def insert_station_names(self, stations_list: list):
        # Insert names into db and commit
        sql = """
        INSERT INTO stations(sid, station, coordinates) VALUES(?, ?, ?);
        """
        stations_tuple_list = [
            (station.id, station.name, station.coords) for station in stations_list
        ]
        self.cursor.executemany(sql, stations_tuple_list)
        self.conn.commit()

    def insert_fares(self, station_pair_list: list):
        # Insert fare information into db
        sql = """
        INSERT INTO fares(dept, arr, peak, offpeak, reduced) VALUES(?, ?, ?, ?, ?)
        """
        self.cursor.executemany(sql, station_pair_list)
        self.conn.commit()
