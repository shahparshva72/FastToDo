from pydantic import BaseModel
from datetime import datetime

class TaskSchema(BaseModel):
    taskName: str
    taskDescription: str
    dueDate: datetime
    isCompleted: bool
    
class TaskResponseSchema(TaskSchema):
    id: int


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


class UserSchema(BaseModel):
    id: int
    username: str
