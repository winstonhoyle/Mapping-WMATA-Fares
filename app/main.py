from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get('/station/{code}', response_model=schemas.Station, description='Returns station')
async def read_station(code: str = None, db: Session = Depends(get_db)):
    station = crud.get_station(db, code=code)

    return station


@app.get('/line/{color}', response_model=schemas.Line, description='Returns line')
async def read_line(color: models.StationColors, db: Session = Depends(get_db)):
    line = crud.get_line(db, color=color)

    return line
