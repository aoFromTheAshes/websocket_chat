from sqlmodel import SQLModel

class RoomCreate(SQLModel):
    name: str