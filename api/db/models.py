from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import relationship
from db.session import engine
from datetime import datetime

Base: DeclarativeMeta = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    refresh_tokens = relationship("RefreshTokenModel", back_populates="user")

class UserInDB(User):
    hashed_password = Column(String)

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    taskName = Column(String)
    taskDescription = Column(String)
    dueDate = Column(DateTime)
    isCompleted = Column(Boolean)
    userId = Column(Integer, ForeignKey('users.id'))

class RefreshTokenModel(Base):
    __tablename__ = 'refresh_tokens'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token = Column(String, index=True, unique=True, nullable=False)
    expiry = Column(DateTime, nullable=False)
    user = relationship("User", back_populates="refresh_tokens")

# Define the ORM relationship between User and Task
User.tasks = relationship("Task", back_populates="owner")
Task.owner = relationship("User", back_populates="tasks")

# Create tables in the database
Base.metadata.create_all(bind=engine)
