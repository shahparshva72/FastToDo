from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Cookie
from jose import JWTError, jwt
from passlib.context import CryptContext
from settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordBearer
from db.models import User, UserInDB, RefreshTokenModel
from db.session import get_db
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_id(db: Session, user_id: int):
    return db.query(UserInDB).filter(User.id == user_id).first()

def get_current_user(access_token: str = Cookie(None), db: Session = Depends(get_db)):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        user = get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user


def verify_refresh_token(refresh_token: str, db: Session):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if not refresh_token_is_valid(user_id, refresh_token, db):
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    return user_id



def refresh_token_is_valid(user_id: int, token: str, db: Session):
    stored_token = db.query(RefreshTokenModel).filter(
        RefreshTokenModel.user_id == user_id,
        RefreshTokenModel.token == token
    ).first()
    
    if stored_token is None:
        return False
    
    if datetime.utcnow() > stored_token.expiry:
        return False
    
    return True

