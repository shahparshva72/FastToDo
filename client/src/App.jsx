import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Onboarding/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Onboarding/Register";
import axios from "axios";
import { AuthProvider, useAuth } from "./AuthContext";

const MainApp = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  axios.defaults.baseURL = "http://127.0.0.1:8000";
  axios.defaults.withCredentials = true;

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
