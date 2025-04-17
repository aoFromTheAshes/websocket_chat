from .database import engine
from .models.user import User
from .models.room import Room 
from sqlmodel import SQLModel

def create_all_tables():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    create_all_tables()