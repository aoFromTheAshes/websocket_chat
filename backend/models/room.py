from sqlmodel import SQLModel, Field
from typing import Optional
import uuid

class Room(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    creator: str  # username
