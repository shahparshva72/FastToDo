import os
from datetime import datetime, timedelta
from typing import List

from dotenv import load_dotenv
from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer, String,
                        create_engine)
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker

# Load environment variables
# ---------------------------
load_dotenv()

# Database setup
# -----------------
DATABASE_URL = "sqlite:///./test.db"
Base: DeclarativeMeta = declarative_base()
engine = create_engine(DATABASE_URL)
# Creates a custom Session class bound to the database engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Context manager for database session
# --------------------------------------


async def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

# ORM Models
# ----------------


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    taskName = Column(String)
    taskDescription = Column(String)
    dueDate = Column(DateTime)
    isCompleted = Column(Boolean)
    userId = Column(Integer, ForeignKey('users.id'))


class TaskSchema(BaseModel):
    id: int
    taskName: str
    taskDescription: str
    dueDate: datetime
    isCompleted: bool
    userId: int


# Define the ORM relationship between User and Task
User.tasks = relationship("Task", back_populates="owner")
Task.owner = relationship("User", back_populates="tasks")

# Create tables in the database
Base.metadata.create_all(bind=engine)

# FastAPI and Security setup
# -------------------------------
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Token models
# ----------------


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


class UserSchema(BaseModel):
    id: int
    username: str

# Helper functions
# -------------------


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(access_token: str = Cookie(None)):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return username


# API Endpoints
# -------------------
@app.post("/token", response_model=Token)
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
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


@app.post("/users/")
def create_user(username: str, password: str, db: Session = Depends(get_db)):
    # User creation logic here
    hashed_password = get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"username": username, "id": new_user.id}


@app.get("/get-user", response_model=UserSchema)
def get_user(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"username": user.username, "id": user.id}


@app.post("/tasks/")
def create_task(taskName: str, taskDescription: str, dueDate: datetime, isCompleted: bool, userId: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Task creation logic here
    new_task = Task(taskName=taskName, taskDescription=taskDescription,
                    dueDate=dueDate, isCompleted=isCompleted, userId=userId)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@app.get("/tasks/", response_model=List[TaskSchema])
def get_tasks(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Fetch the user object from the database using the current username
    user = db.query(User).filter(User.username == current_user).first()

    # If the user does not exist, raise an HTTP exception
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Fetch tasks for the user based on the user ID
    tasks = db.query(Task).filter(Task.userId == user.id).all()
    return tasks

# Delete task endpoint


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Fetch the user object from the database using the current username
    user = db.query(User).filter(User.username == current_user).first()

    # If the user does not exist, raise an HTTP exception
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Fetch the task to be deleted
    task = db.query(Task).filter(Task.id == task_id).first()

    # If the task does not exist, raise an HTTP exception
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Delete the task
    db.delete(task)
    db.commit()

    # Return a success message
    return {"detail": "Task deleted successfully"}


@app.put("/tasks/{task_id}", response_model=TaskSchema)
def update_task(task_id: int, task_data: TaskSchema, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.taskName = task_data.taskName
    task.taskDescription = task_data.taskDescription
    task.dueDate = task_data.dueDate
    task.isCompleted = task_data.isCompleted

    db.commit()
    return task


@app.post("/logout")
def logout(response: Response, current_user: str = Depends(get_current_user)):
    # Delete the cookie by setting its expiry time to the past
    response.delete_cookie(key="access_token", httponly=True,
                           secure=True, samesite="none")
    return {"detail": "Successfully logged out"}
