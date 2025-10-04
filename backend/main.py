from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db, engine
import auth
from jose import JWTError, jwt
from datetime import timedelta
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Bill Manager API", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-service-production-64b7.up.railway.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get current user from token - WITH DEBUGGING
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    print(f"🔐 [DEBUG] get_current_user called")
    print(f"🔐 [DEBUG] Token received: {token}")
    
    if not token or token == "null" or token == "undefined":
        print("❌ [DEBUG] Token is empty or invalid")
        raise credentials_exception
    
    try:
        # Try to decode the token
        print(f"🔐 [DEBUG] Attempting to decode token with SECRET_KEY: {auth.SECRET_KEY}")
        print(f"🔐 [DEBUG] Using algorithm: {auth.ALGORITHM}")
        
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        print(f"🔐 [DEBUG] Token decoded successfully: {payload}")
        
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        
        print(f"🔐 [DEBUG] Extracted user_id: {user_id}, email: {email}")
        
        if user_id is None:
            print("❌ [DEBUG] user_id is None in token payload")
            raise credentials_exception
        
        # Get user from database
        user = db.query(models.User).filter(models.User.id == user_id).first()
        print(f"🔐 [DEBUG] User query result: {user}")
        
        if user is None:
            print("❌ [DEBUG] No user found in database with this ID")
            raise credentials_exception
        
        print(f"✅ [DEBUG] Authentication SUCCESS for user: {user.email}")
        return user
        
    except JWTError as e:
        print(f"❌ [DEBUG] JWTError: {e}")
        print(f"❌ [DEBUG] Token is invalid or expired")
        raise credentials_exception
    except Exception as e:
        print(f"❌ [DEBUG] Unexpected error: {e}")
        raise credentials_exception

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Bill Manager API!"}

# USER REGISTRATION
@app.post("/register/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"👤 [DEBUG] Registering user: {user.email}")
    
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
    
    print(f"✅ [DEBUG] User registered successfully: {db_user.id}")
    return db_user

# USER LOGIN
@app.post("/login/")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print(f"🔐 [DEBUG] Login attempt for: {form_data.username}")
    
    # Find user by email
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    print(f"🔐 [DEBUG] User found: {db_user}")
    
    # Check if user exists and password is correct
    if not db_user:
        print("❌ [DEBUG] User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    password_valid = auth.verify_password(form_data.password, db_user.hashed_password)
    print(f"🔐 [DEBUG] Password valid: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    token_data = {"user_id": db_user.id, "email": db_user.email}
    
    print(f"🔐 [DEBUG] Creating token with data: {token_data}")
    access_token = auth.create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    print(f"🔐 [DEBUG] Token created: {access_token}")
    print(f"✅ [DEBUG] Login SUCCESS for user_id: {db_user.id}")
    
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
    print(f"📝 [DEBUG] Creating subscription for user: {current_user.email}")
    print(f"📝 [DEBUG] Subscription data: {subscription.dict()}")
    
    # Create a new subscription linked to the current user
    db_subscription = models.Subscription(
        **subscription.dict(),
        owner_id=current_user.id  # Link to current user
    )
    
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    print(f"✅ [DEBUG] Subscription created successfully: {db_subscription.id}")
    return db_subscription

# READ all subscriptions (PROTECTED - user-specific)
@app.get("/subscriptions/", response_model=List[schemas.Subscription])
def read_subscriptions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"📖 [DEBUG] Fetching subscriptions for user: {current_user.email}")
    
    # Only get subscriptions for the current user
    subscriptions = db.query(models.Subscription).filter(
        models.Subscription.owner_id == current_user.id
    ).all()
    
    print(f"✅ [DEBUG] Found {len(subscriptions)} subscriptions")
    return subscriptions

# UPDATE a subscription (PROTECTED)
@app.put("/subscriptions/{subscription_id}", response_model=schemas.Subscription)
def update_subscription(
    subscription_id: int,
    subscription_update: schemas.SubscriptionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the subscription
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id,
        models.Subscription.owner_id == current_user.id  # User can only update their own
    ).first()
    
    if not db_subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    # Update the subscription
    for field, value in subscription_update.dict().items():
        setattr(db_subscription, field, value)
    
    db.commit()
    db.refresh(db_subscription)
    
    return db_subscription

# DELETE a subscription (PROTECTED)
@app.delete("/subscriptions/{subscription_id}")
def delete_subscription(
    subscription_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the subscription
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id,
        models.Subscription.owner_id == current_user.id  # User can only delete their own
    ).first()
    
    if not db_subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    # Delete the subscription
    db.delete(db_subscription)
    db.commit()
    
    return {"message": "Subscription deleted successfully"}
