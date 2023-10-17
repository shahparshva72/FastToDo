import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUsername: setContextUsername, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();


  const goToLogin = () => {
    navigate("/login");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/auth/register/?username=${username}&password=${password}`, null, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.status === 200) {
        // User registered successfully
        console.log("User registered:", response.data);

        // Now perform auto-login
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
          setContextUsername(username);  // Set username state
          setIsLoggedIn(true);  // Set login state
          navigate("/");  // Navigate to the home/dashboard page
        }
      }
    } catch (error) {
      console.error("Error during registration or login:", error);
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
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center p-6">
          <h2 className="mt-4 text-4xl font-semibold text-gray-800">
            Join Task Manager
          </h2>
          <h3 className="mt-2 text-xl text-gray-600">
            Start managing your tasks and stay organized.
          </h3>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-user text-gray-400"></i>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-lock text-gray-400"></i>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-200"
            >
              Register
            </button>
            <button
              onClick={goToLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-white text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-200"
            >
              Sign In Instead
            </button>
          </div>
        </form>
      </div>

    </div>
  );

};

export default Register;
