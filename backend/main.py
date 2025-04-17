from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query, status, WebSocketException
from fastapi.middleware.cors import CORSMiddleware
from backend.create_tables import create_all_tables

from .routers.auth import router as auth_router
from .routers.rooms import router as rooms_router

from .auth.auth import get_current_user_token
from .manager import ConnectionManager

manager = ConnectionManager()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(rooms_router)

# === Зберігаємо кімнати і підключених клієнтів ===
rooms: dict[str, list[WebSocket]] = {}
active_users: dict[str, list[str]] = {}

# === Функція для перевірки токена ===
async def get_token(token: str = Query(default=None)):
    if not token:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    # TODO: перевірка JWT токена (реально, через fastapi_users або вручну)
    return token  # можна ще повертати user_id

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()

    token = websocket.query_params.get("token")

    try:
        username = await get_current_user_token(token)
    except WebSocketException as e:
        await websocket.close(code=e.code)
        return

    await manager.connect(room_id, websocket)

    if room_id not in active_users:
        active_users[room_id] = []

    if username not in active_users[room_id]:
        active_users[room_id].append(username)

    await manager.broadcast(room_id, {
        "type": "user_list",
        "users": active_users[room_id]
    })

    try:
        while True:
            data = await websocket.receive_text()

            await manager.broadcast(room_id, {
                "type": "chat_message",
                "username": username,
                "message": data
            })

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)

        if room_id in active_users and username in active_users[room_id]:
            active_users[room_id].remove(username)

        await manager.broadcast(room_id, {
            "type": "user_list",
            "users": active_users[room_id]
        })

        if room_id in active_users and not active_users[room_id]:
            del active_users[room_id]

    finally:
        await websocket.close()

@app.get("/")
def home():
    return {"message": "Welcome to Chat API"}
