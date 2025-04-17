import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const handleLogin = (): void => {
        if (!email || !password) {
            alert("Заповніть всі поля!");
            return;
        }

        console.log("🟡 Відправляємо логін-запит:", { email, password });

        axios.post("http://127.0.0.1:8000/auth/login", { email, password })
            .then(response => {
                console.log("✅ Успішний вхід:", response.data);
                localStorage.setItem("token", response.data.access_token);
                alert("Вхід успішний!");
                navigate("/chat/:roomId");
            })
            .catch(error => {
                console.error("❌ Помилка авторизації", error.response?.data || error.message);
                alert("Неправильний email або пароль");
            });
    };

    return (
        <div>
            <h2>Вхід</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
            />
            <button onClick={handleLogin}>Увійти</button>
            <p>Ще не маєте акаунта? <a href="/register">Зареєструйтесь</a></p>
        </div>
    );
};

export default Login;
