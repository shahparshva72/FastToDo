from fastapi import APIRouter, Depends, Response, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import User, UserInDB
from core.security import create_access_token, get_password_hash, verify_password
from typing import Annotated
from core.security import get_current_user
from schemas import UserSchema, Token

router = APIRouter()

@router.get("/get-user/", response_model=UserSchema)
def get_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/login/", response_model=Token)
def login_for_access_token(response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = db.query(UserInDB).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(
        data={"id": user.id, "username": user.username})
    response.set_cookie(key="access_token", value=access_token,
                        httponly=True, secure=True, samesite="none")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register/")
def create_user(username: str, password: str, db: Session = Depends(get_db)):
    # User creation logic here
    hashed_password = get_password_hash(password)
    new_user = UserInDB(username=username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"username": username, "id": new_user.id}

@router.post("/logout/")
def logout(response: Response):
    # Delete the cookie by setting its expiry time to the past
    response.delete_cookie(key="access_token", httponly=True,
                           secure=True, samesite="none")
    return {"detail": "Successfully logged out"}