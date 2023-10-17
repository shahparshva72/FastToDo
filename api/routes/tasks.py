from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from schemas import TaskSchema, TaskResponseSchema
from db.session import get_db
from db.models import Task, User, UserInDB
from core.security import get_current_user
from typing import List

router = APIRouter()

# create task endpoint
@router.post("/tasks/")
def create_task(taskData: TaskSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Task creation logic here
    new_task = Task(taskName=taskData.taskName, taskDescription=taskData.taskDescription,
                    dueDate=taskData.dueDate, isCompleted=taskData.isCompleted, userId=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.get("/tasks/", response_model=List[TaskResponseSchema])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the user object from the database using the current username
    user = db.query(User).filter(User.username == current_user.username).first()

    # If the user does not exist, raise an HTTP exception
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Fetch tasks for the user based on the user ID
    tasks = db.query(Task).filter(Task.userId == user.id).all()
    return tasks

# Delete task endpoint
@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the user object from the database using the current username
    user = db.query(User).filter(User.id == current_user.id).first()

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


# Update task endpoint
@router.put("/tasks/{task_id}", response_model=TaskSchema)
def update_task(task_id: int, task_data: TaskSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(UserInDB).filter(User.id == current_user.id).first()
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
