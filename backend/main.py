from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query, status, WebSocketException
from fastapi.middleware.cors import CORSMiddleware
import traceback

from .create_tables import create_all_tables
from .routers.auth import router as auth_router
from .routers.rooms import router as rooms_router
from .auth.auth import get_current_user_token_from_ws
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

rooms: dict[str, list[WebSocket]] = {}
active_users: dict[str, list[str]] = {}

async def get_username_from_token(token: str = Query(...)) -> str:
    if not token:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    return await get_current_user_token_from_ws(token)


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    username: str = Depends(get_username_from_token)
):
    await websocket.accept()
    print(f"✅ {username} підключається до кімнати '{room_id}' з токеном.")

    try:
        await manager.connect(room_id, websocket)
        print(f"🔗 {username} підключений до '{room_id}'")

        active_users.setdefault(room_id, [])
        if username not in active_users[room_id]:
            active_users[room_id].append(username)
            print(f"➕ {username} доданий до '{room_id}'. Активні: {active_users[room_id]}")

        await manager.broadcast(room_id, {
            "type": "user_list",
            "users": active_users[room_id]
        })

        while True:
            data = await websocket.receive_text()
            print(f"📨 Повідомлення від {username}: {data}")

            await manager.broadcast(room_id, {
                "type": "chat_message",
                "username": username,
                "message": data
            })

    except WebSocketDisconnect:
        print(f"⚠️ {username} відключився")
        manager.disconnect(room_id, websocket)

        if username in active_users.get(room_id, []):
            active_users[room_id].remove(username)
            await manager.broadcast(room_id, {
                "type": "user_list",
                "users": active_users[room_id]
            })
            print(f"🧹 Оновлено список: {active_users[room_id]}")

        if not active_users[room_id]:
            del active_users[room_id]
            print(f"🗑️ Кімната '{room_id}' видалена")

    except WebSocketException as e:
        print(f"❌ WebSocketException: {e}")
        await websocket.close(code=e.code)

    except Exception as e:
        print("🔥 Невідома помилка в WebSocket:")
        traceback.print_exc()
        await websocket.close(code=1011)

    finally:
        if websocket.client_state.name != "DISCONNECTED":
            print(f"🔒 Закриваємо з'єднання для {username}")
            await websocket.close()


@app.get("/")
def home():
    return {"message": "Welcome to Chat API"}
