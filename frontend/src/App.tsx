import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from './pages/Chat';
import RegisterForm from './pages/Register';
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
