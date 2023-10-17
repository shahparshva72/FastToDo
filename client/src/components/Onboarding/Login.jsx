import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn, setUsername: setContextUsername } = useAuth();
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const tokenResponse = await axios.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      });

      if (tokenResponse.status === 200 && tokenResponse.data.access_token) {
        try {
          const userResponse = await axios.get("/auth/get-user", {
            withCredentials: true
          });
          if (userResponse.status === 200) {
            setContextUsername(username);
            setIsLoggedIn(true);
          }
        } catch (getUserError) {
          console.error("Could not get user data:", getUserError);
        }
      }
    } catch (loginError) {
      console.error("There was an error logging in:", loginError);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-white text-6xl font-bold tracking-widest mb-4">
          Task Manager
        </h1>
        <p className="text-white text-2xl font-semibold italic">
          Organize Tomorrow, Today.
        </p>
      </div>


      <div className="max-w-md w-full space-y-8 bg-white p-4 rounded-lg shadow-lg">
        <div className="text-center p-6">
          <h2 className="mt-4 text-4xl font-semibold text-gray-800">
            Sign In to your account.
          </h2>
          <h3 className="mt-2 text-xl text-gray-600">
            Access and manage your tasks seamlessly.
          </h3>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 mb-2"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={goToRegister}
              className="group relative w-full flex justify-center py-2 px-4 border border-white text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Don't have an account? Register here
            </button>
          </div>


        </form>
      </div>
    </div>
  );

};

export default Login;
