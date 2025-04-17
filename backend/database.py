import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

from .config import DB_NAME, DB_HOST, DB_PASS, DB_PORT, DB_USER

# Завантажуємо змінні середовища
load_dotenv()

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Створюємо підключення до бази
engine = create_engine(DATABASE_URL, echo=True)

# Функція для отримання сесії
def get_db():
    with Session(engine) as session:
        yield session

def create_tables():
    SQLModel.metadata.create_all(engine)