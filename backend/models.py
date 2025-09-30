from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationship: One User has many Subscriptions
    subscriptions = relationship("Subscription", back_populates="owner")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="GBP")
    due_date = Column(Date, nullable=False)
    category = Column(String, index=True)
    recurring_schedule = Column(String)
    notes = Column(String, nullable=True)

    # Foreign Key to link to the User - FIXED SYNTAX
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: Each Subscription belongs to one User - FIXED SYNTAX
    owner = relationship("User", back_populates="subscriptions")



