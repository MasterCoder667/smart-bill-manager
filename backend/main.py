from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db, engine
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY
from jose import JWTError, jwt
from datetime import timedelta

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Bill Manager API", version="0.1.0")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Bill Manager API!"}

# USER REGISTRATION
@app.post("/register/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

# USER LOGIN
@app.post("/login/")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Find user by email
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Check if user exists and password is correct
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"user_id": db_user.id, "email": db_user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id
    }

# CREATE a new subscription
@app.post("/subscriptions/", response_model=schemas.Subscription)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
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