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
      const response = await axios.get("/auth/get-user", { withCredentials: true });
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUsername(response.data.username);
        setId(response.data.id);
      }
    } catch (error) {
      const isRefreshed = await refreshAccessToken();
      if (!isRefreshed) {
        setIsLoggedIn(false);
      }
      setError(error.response.data);
    }
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  // Simplified Axios interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        const isRefreshed = await refreshAccessToken();  // Implement this function
        if (!isRefreshed) {
          setIsLoggedIn(false);
        }
      }
      return Promise.reject(error);
    }
  );

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post("/auth/token/refresh");
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      return false;
    }
  };


  const logout = async () => {
    try {
      await axios.post("/auth/logout");
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
