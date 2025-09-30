from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    subscriptions = relationship('Subscription', back_populates='owner')


class Subscription(Base):
    __subscriptions__ = 'subscriptions'

    name = Column(String, primary_key=True, index=True)
    price = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default='GBP')
    due_date = Column(Date, nullable=True)
    is_recurring = Column(Boolean, default=True)
    category = Column(String, nullable=False, index=True)

    owner_id = Column(Integer, ForeignKey='users.id')
    owner = relationship('users', back_populates='subscriptions')
    




