import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = "sqlite:///./test.db"
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
