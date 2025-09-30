from pydantic import BaseModel
from datetime import date
from typing import Optional

class SubscriptionCreate(BaseModel):
    name: str
    price: float
    due_date: date
    category: str
    recurring_schedule: str  # Changed from is_recurring
    notes: Optional[str] = None
    # Remove currency - let the database handle the default

class Subscription(BaseModel):
    id: int
    name: str
    price: float
    due_date: date
    category: str
    currency: str
    recurring_schedule: str  # Changed from is_recurring
    notes: Optional[str] = None

    class Config:
        from_attributes = True