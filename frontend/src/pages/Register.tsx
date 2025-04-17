import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const navigate = useNavigate();

    const handleRegister = (): void => {
        if (!username || !email || !password || !confirmPassword) {
            alert("Please fill in all fields!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        console.log("🟡 Sending registration request:", {username, email, password });

        axios.post("http://127.0.0.1:8000/auth/register", { username, email, password })
            .then(() => {
                alert("Registration successful! Please log in.");
                navigate("/auth");
            })
            .catch(error => {
                console.error("❌ Registration error", error.response?.data || error.message);
                alert(error.response?.data?.detail || "Registration failed");
            });
    };

    return (
        <div className="register">
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
            <p>Already have an account? <a href="/auth">Log in</a></p>
        </div>
    );
};

export default RegisterForm;
