from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import relationship
from db.session import engine

Base: DeclarativeMeta = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)

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


# Define the ORM relationship between User and Task
User.tasks = relationship("Task", back_populates="owner")
Task.owner = relationship("User", back_populates="tasks")

# Create tables in the database
Base.metadata.create_all(bind=engine)
