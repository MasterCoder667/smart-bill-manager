from pydantic import BaseModel  # ← Remove EmailStr
from datetime import date
from typing import Optional

class SubscriptionCreate(BaseModel):
    name: str
    price: float
    due_date: date
    category: str
    recurring_schedule: str
    notes: Optional[str] = None

class Subscription(BaseModel):
    id: int
    name: str
    price: float
    due_date: date
    category: str
    currency: str
    recurring_schedule: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# User Authentication Schemas - FIX THESE LINES
class UserCreate(BaseModel):
    email: str  # ← Changed from EmailStr to str
    password: str

class UserLogin(BaseModel):
    email: str  # ← Changed from EmailStr to str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str