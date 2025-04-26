import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoomSelector from "../pages/RoomSelector";

const Chat = () => {
  const [messages, setMessages] = useState<{ username?: string; message: string; type?: string }[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [username, setUsername] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const [token, setToken] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
    } else {
      setToken(storedToken);
    }
  }, []);

  // Автоматичне прокручування вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId || !token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}?token=${token}`);

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket з'єднано");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
    
      if (data.type === "user_list") {
        setActiveUsers(data.users);
      } else if (data.type === "chat") {
        const chatMessage = {
          username: data.username,
          message: data.message,
        };
        setMessages((prev) => [...prev, chatMessage]);
      }
    };
    

    ws.onerror = (err) => {
      console.error("❌ WebSocket помилка:", err);
      alert("Помилка WebSocket-з'єднання.");
      ws.close();
    };

    ws.onclose = (event) => {
      console.warn("🔒 З'єднання закрито:", event.code);
      setConnected(false);

      if (event.code === 1008) {
        alert("Невірний токен. Авторизуйтесь знову.");
        navigate("/login");
      }

      // Повторне підключення
      setTimeout(() => {
        if (socketRef.current === ws) {
          console.log("♻️ Повторне підключення...");
          window.location.reload(); // або можна викликати connectWebSocket знову
        }
      }, 2000);
    };

    return () => {
      ws.close();
    };
  }, [roomId, token]);

  const handleSend = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && input.trim()) {
      const messageData = {
        type: "chat",
        username: username,
        message: input,
      };
      socketRef.current.send(JSON.stringify(messageData));
      setMessages((prev) => [...prev, { username: username, message: input}]);
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

      <div>
        <label>👤 Ваше ім’я:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <span style={{ marginLeft: "10px", color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div>
        <h3>Активні користувачі:</h3>
        <ul>
          {activeUsers.map((user) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>

      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type === "system" ? (
              <p style={{ color: "gray", fontStyle: "italic" }}>{msg.message}</p>
            ) : (
              <p>
                <strong>{msg.username || "System"}</strong>: {msg.message}
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Напишіть повідомлення..."
      />
      <button onClick={handleSend} disabled={!connected || !input.trim()}>
        Send
      </button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Chat;
