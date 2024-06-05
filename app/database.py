from dotenv import dotenv_values

# Need this instead of `load_spatialite` because it's a gpkg
from geoalchemy2 import load_spatialite_gpkg

from sqlalchemy import create_engine
from sqlalchemy.event import listen
from sqlalchemy.orm import sessionmaker, declarative_base

env = dotenv_values(".env")
print(env)

SQLALCHEMY_DATABASE_URL = env["SQLALCHEMY_DATABASE_URL"]

# Could be any database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Just for gpkg/sqlite
listen(engine, "connect", load_spatialite_gpkg)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
