from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..auth.auth import get_current_user_token_from_ws
from ..database import get_db
from ..models.room import Room

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.post("/", status_code=201)
def create_room(name: str, session: Session = Depends(get_db), username: str = Depends(get_current_user_token_from_ws)):
    existing_room = session.exec(select(Room).where(Room.name == name)).first()
    if existing_room:
        raise HTTPException(status_code=400, detail="Room already exists")

    new_room = Room(name=name, creator=username)
    session.add(new_room)
    session.commit()
    session.refresh(new_room)
    return {"message": f"Room '{name}' created by {username}", "room_id": new_room.id}

@router.get("/", response_model=List[Room])
def get_all_rooms(session: Session = Depends(get_db)):
    rooms = session.exec(select(Room)).all()
    return rooms

@router.delete("/{room_id}")
def delete_room(room_id: str, session: Session = Depends(get_db), username: str = Depends(get_current_user_token_from_ws)):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.creator != username:
        raise HTTPException(status_code=403, detail="You can only delete your own rooms")

    session.delete(room)
    session.commit()
    return {"message": f"Room '{room.name}' deleted by {username}"}
