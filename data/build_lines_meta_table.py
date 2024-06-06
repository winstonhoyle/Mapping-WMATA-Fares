import pandas
import sqlite3

from dotenv import dotenv_values
from tqdm import tqdm

from wmata import WMATA


def build_tables(api_key):

    wmata = WMATA(api_key=api_key)

    # Connect to db
    dbfile = "gpkg/lines.gpkg"
    con = sqlite3.connect(dbfile)
    cur = con.cursor()

    # Create index
    sql = "CREATE INDEX line_index ON lines (COLOR_ID);"
    cur.execute(sql)
    con.commit()

    # Create stations table
    df = pandas.read_csv("csv/stations.csv")
    df.to_sql("stations", con, if_exists="fail", index=False)
    del df
    con.commit()

    # Create fares table
    df = pandas.read_csv("csv/fares.csv")
    df.to_sql("fares", con, if_exists="fail", index=True, index_label="fare_id")

    sql_create_station_id = "CREATE INDEX station_id ON stations (station_id);"
    cur.execute(sql_create_station_id)
    con.commit()
    del df

    # Create indices for fares table
    sql_create_src_idx = "CREATE INDEX src_idx ON fares (src);"
    sql_create_dst_idx = "CREATE INDEX dst_idx ON fares (dst);"
    cur.execute(sql_create_src_idx)
    cur.execute(sql_create_dst_idx)
    con.commit()

    # Get lines
    cur = cur.execute("SELECT COLOR, NAME FROM lines")
    result = cur.fetchall()
    for color_code, color_name in tqdm(result, desc="Creating Line's Station Tables"):

        # Get line info
        line = wmata.get_line(color_code)

        # This receives the code
        stations = [station["Code"] for station in line]

        # Build a query off the code
        sql = "SELECT station_id FROM stations WHERE " + " OR ".join(
            [f'code = "{station_code}"' for station_code in stations]
        )
        cur = cur.execute(sql)

        # Get the index ids
        ids = cur.fetchall()

        # Create a new table for the line
        create_table = f"""
            CREATE TABLE IF NOT EXISTS {color_name} (
            sid INTEGER PRIMARY KEY,
            station_id INT NOT NULL
            );
            """
        cur = cur.execute(create_table)
        con.commit()

        # Fill table with ids
        cur.executemany(f"INSERT INTO {color_name} VALUES (NULL,?)", ids)
        con.commit()

    con.close()


if __name__ == "__main__":

    env = dotenv_values("../.env")

    # Insert api_key
    api_key = env["WMATA_API_KEY"]
    main(api_key=api_key)
