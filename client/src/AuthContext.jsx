import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children, initialState = false }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(initialState);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);

  const checkAuthenticated = async () => {
    try {
      const response = await axios.get("/get-user", { withCredentials: true });
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUsername(response.data.username);
        setId(response.data.id);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
      }
      setError(error.response.data); // Storing the error information.
    }
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  // Simplified Axios interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
      }
      return Promise.reject(error);
    }
  );

  const logout = async () => {
    try {
      await axios.post("/logout");
      setIsLoggedIn(false);
    } catch (error) {
      setError(error.response.data);
    }
  };

  const value = {
    isLoggedIn,
    setIsLoggedIn,
    logout,
    error,
    username,
    setUsername,
    id,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
