from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db, engine
import auth
from jose import JWTError, jwt
from datetime import timedelta

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Bill Manager API", version="0.1.0")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify the token
    user_data = auth.verify_token(token)
    if user_data is None:
        raise credentials_exception
    
    # Get user from database
    user = db.query(models.User).filter(models.User.id == user_data["user_id"]).first()
    if user is None:
        raise credentials_exception
    
    return user

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
    hashed_password = auth.get_password_hash(user.password)
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
    if not db_user or not auth.verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = auth.create_access_token(
        data={"user_id": db_user.id, "email": db_user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id
    }

# CREATE a new subscription (PROTECTED)
@app.post("/subscriptions/", response_model=schemas.Subscription)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create a new subscription linked to the current user
    db_subscription = models.Subscription(
        **subscription.dict(),
        owner_id=current_user.id  # Link to current user
    )
    
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    return db_subscription

# READ all subscriptions (PROTECTED - user-specific)
@app.get("/subscriptions/", response_model=List[schemas.Subscription])
def read_subscriptions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only get subscriptions for the current user
    subscriptions = db.query(models.Subscription).filter(
        models.Subscription.owner_id == current_user.id
    ).all()
    return subscriptions