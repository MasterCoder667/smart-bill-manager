from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Bill Manager API",version="0.1.0")

@app.get("/")
def dead_root():
    return {"message" : "Welcome to the Smart Bill Manager API!"}

@app.post("/subscriptions/", response_model=schemas.Subscription)
def create_subscription(
    subscription : schemas.Subscription,
    db : Session = Depends(get_db)
):

    db_subscription = models.Subscription(**subscription.dict())

    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)

    return db_subscription


@app.get("/subscriptions/", response_model=List[schemas.Subscription])
def read_subscriptions(db: Session = Depends(get_db)):
    subscriptions = db.query(models.Subscription).all()
    return subscriptions