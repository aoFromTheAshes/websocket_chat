import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoomSelector from "../pages/RoomSelector"; // або ./RoomSelector — залежно де файл

const Chat = () => {
  const [messages, setMessages] = useState<{ username: string; message: string }[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!roomId || !token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}?token=${token}`);
    setSocket(ws);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "user_list") {
        setActiveUsers(data.users); // 🔹 оновлюємо список активних користувачів
      } else {
        setMessages(prev => [...prev, data]); // 🔹 звичайне повідомлення
      }
    };

    ws.onclose = () => {
      console.log("Socket closed");
    };

    return () => {
      ws.close();
    };
  }, [roomId, token]);

  const handleSend = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(input);
      setInput("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <RoomSelector />
      <h2>Chat Room: {roomId}</h2>

      {/* 🔸 Виводимо активних юзерів */}
      <div>
        <h3>Активні в кімнаті:</h3>
        <ul>
          {activeUsers.map(user => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>

      <div>
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.username}</strong>: {msg.message}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={handleSend}>Send</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Chat;
