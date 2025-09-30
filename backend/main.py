from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Bill Manager API", version="0.1.0")

# Test endpoint - FIXED: changed dead_root to read_root
@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Bill Manager API!"}

# CREATE a new subscription - FIXED: changed schemas.Subscription to schemas.SubscriptionCreate
@app.post("/subscriptions/", response_model=schemas.Subscription)
def create_subscription(
    subscription: schemas.SubscriptionCreate,  # FIXED THIS LINE
    db: Session = Depends(get_db)
):
    # Create a new subscription model instance
    db_subscription = models.Subscription(**subscription.dict())
    
    # Add to database
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)  # Refresh to get the ID
    
    return db_subscription

# READ all subscriptions
@app.get("/subscriptions/", response_model=List[schemas.Subscription])
def read_subscriptions(db: Session = Depends(get_db)):
    subscriptions = db.query(models.Subscription).all()
    return subscriptions