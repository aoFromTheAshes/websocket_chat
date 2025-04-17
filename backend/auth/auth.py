from fastapi import WebSocket, Query, WebSocketException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # повертає ID користувача та email
    except JWTError:
        return None
    
# 👇 Функція для декодування токена
async def get_current_user_token(token: str = Query(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
        return username
    except JWTError:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
