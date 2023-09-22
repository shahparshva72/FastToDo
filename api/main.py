from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import date
from pydantic import BaseModel


class TaskCreate(BaseModel):
    name: str
    status: bool
    notes: str
    completion_date: date


# Initialize FastAPI and SQLAlchemy
app = FastAPI()
engine = create_engine("sqlite:///./tasks.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Define Data Model
class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(Boolean, default=False)
    notes = Column(String)
    completion_date = Column(Date)


# Create Database Tables
Base.metadata.create_all(bind=engine)


# Add a new task
@app.post("/task/")
def add_task(task: TaskCreate):
    db = SessionLocal()
    db_task = Task(name=task.name, status=task.status, notes=task.notes, completion_date=task.completion_date)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {"id": db_task.id, "name": task.name, "status": task.status, 'notes': task.notes,
            "completion_date": task.completion_date}


# Update an existing task
@app.put("/task/{task_id}")
def update_task(task_id: int, name: str = None, status: bool = None, notes: None = None, completion_date: date = None):
    db = SessionLocal()
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        if name is not None:
            task.name = name
        if status is not None:
            task.status = status
        if notes is not None:
            task.notes = notes
        if completion_date is not None:
            task.completion_date = completion_date
        db.commit()
        return {"message": "Task updated"}
    else:
        return {"message": "Task not found"}


# Get all tasks
@app.get("/tasks/")
def get_tasks():
    db = SessionLocal()
    tasks = db.query(Task).all()
    return {"tasks": [
        {"id": x.id, "name": x.name, "status": x.status, 'notes': x.notes, "completion_date": x.completion_date} for x
        in
        tasks]}


# Delete a task
@app.delete("/task/{task_id}")
def delete_task(task_id: int):
    db = SessionLocal()
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        db.delete(task)
        db.commit()
        return {"message": "Task deleted"}
    else:
        return {"message": "Task not found"}
