from sqlalchemy.orm import Session

from . import models, schemas


def get_station(db: Session, code: str):
    return db.query(models.Station).filter(models.Station.code == code).first()


def get_line(db: Session, color: str):
    return db.query(models.Line).filter(models.Line.color == color).first()
