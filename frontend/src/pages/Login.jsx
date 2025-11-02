import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../context/UserContext";
import { FaFacebookF, FaGoogle, FaApple } from "react-icons/fa";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // username OR email
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        identifier, // backend checks email or username
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-purple-600 font-medium"
      >
        <ArrowLeft size={20} className="mr-1" />
      </button>

      {/* Login Box */}
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome back! Glad to see you, Again!
        </h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* Email / Username */}
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your email or username"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <span
              onClick={() => navigate("/forgot-password")}
              className="absolute right-3 top-3 text-sm text-purple-600 font-medium cursor-pointer"
            >
              Forgot Password?
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>

        {/* OR login with */}
        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">Or Login with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-6 mt-4">
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaFacebookF className="text-blue-600 text-xl" />
          </button>
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaGoogle className="text-red-500 text-xl" />
          </button>
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaApple className="text-black text-xl" />
          </button>
        </div>

        {/* Register Redirect */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-purple-600 font-semibold hover:underline cursor-pointer"
          >
            Register Now
          </span>
        </p>
      </div>
    </div>
  );
}
