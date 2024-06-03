from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from geoalchemy2 import load_spatialite
from sqlalchemy.event import listen

SQLALCHEMY_DATABASE_URL = 'sqlite:///../data/gpkg/lines.gpkg'


engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False})
listen(engine, "connect", load_spatialite)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
