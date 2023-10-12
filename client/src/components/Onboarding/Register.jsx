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
      const response = await axios.post(`/users/?username=${username}&password=${password}`, null, {
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

        const tokenResponse = await axios.post("/token", formData, {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-white">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create an account to start managing your tasks and stay organized.
          </h2>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center p-4 border border-transparent text-md font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-4">
          <button className="text-white bg-purple-500 p-4 rounded-md hover:bg-purple-700 text-md" onClick={goToLogin}>
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
