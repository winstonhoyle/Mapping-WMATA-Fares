# Mapping-WMATA-Fares
This application helps visualize the confusing fare system of Washington Metropolitan Area Transit Authority (WMATA).

Check it out on [http://wmatafares.com](http://wmatafares.com)

## Prerequisites

* Python 3.10>=
* (Optional) [Spatialite](https://www.gaia-gis.it/fossil/libspatialite/index)
* (Optional) [Sqlite3](https://sqlite.org/)

## Running the application

1. Create a `.env` file based out of the [env.sample](https://github.com/winstonhoyle/Mapping-WMATA-Fares/tree/main/env.sample). You do not need `WMATA_API_KEY` unless you follow the steps in [/data](https://github.com/winstonhoyle/Mapping-WMATA-Fares/tree/main/data/README.md). `SQLALCHEMY_DATABASE_URL` Just points to the Sqlite3 db which is a [Geopackage](https://www.geopackage.org/), if you have created these tables on another database system you can change this value to any database url. 

```bash
python3.10 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cd app/
fastapi run main.py
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
