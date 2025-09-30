from pydantic import BaseModel, EmailStr
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

# User Authentication Schemas

class UserCreate(BaseModel):
    email : EmailStr
    password : str

class UserLogin(BaseModel):
    email : EmailStr
    password : str

class UserResponse(BaseModel):
    id : int
    email : str
    is_active : bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token : str
    token_type : str

