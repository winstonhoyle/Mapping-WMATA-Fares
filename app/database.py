from sqlalchemy import create_engine
from sqlalchemy.event import listen
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Need this instead of `load_spatialite` because it's a gpkg
from geoalchemy2 import load_spatialite_gpkg


SQLALCHEMY_DATABASE_URL = "sqlite:///../data/gpkg/lines.gpkg"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
listen(engine, "connect", load_spatialite_gpkg)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
