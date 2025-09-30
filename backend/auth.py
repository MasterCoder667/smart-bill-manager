from datetime import datetime, timedelta
from jose import JWTError, jwt
import hashlib
import secrets

SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        # Split the hash and salt
        hashed, salt = hashed_password.split(":")
        # Hash the plain password with the same salt
        test_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        # Compare
        return test_hash == hashed
    except:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password with a random salt"""
    salt = secrets.token_hex(16)  # Generate random salt
    # Hash the password + salt
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    # Return "hash:salt" format
    return f"{hashed}:{salt}"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        if user_id is None or email is None:
            return None
        return {"user_id": user_id, "email": email}
    except JWTError:
        return None