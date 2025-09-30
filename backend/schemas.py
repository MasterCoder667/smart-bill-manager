from pydantic import BaseModel
from datetime import date
from typing import Optional

class SubscriptionCreate(BaseModel):
    name : str
    price : float
    due_date : date
    category : str
    currency : str
    is_recurring : bool
    notes : Optional[str] = None

class Subscription(BaseModel):
    id : int
    name : str
    price : float
    due_date : date
    category : str
    currency : str
    is_recurring : bool
    notes : Optional[str] = None

    class Config:
        from_attributes = True #This allows conversion from SQLAlchemy Model
