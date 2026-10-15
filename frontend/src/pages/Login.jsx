import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        email: identifier.trim(),
        password,
      });

      const { token, user } = res.data || {};

      if (!token || !user) {
        throw new Error("Invalid response received from the server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative px-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-purple-600 font-medium"
      >
        <ArrowLeft size={20} className="mr-1" />
      </button>

      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome back! Glad to see you, Again!
        </h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your email or username"
            autoComplete="username"
            required
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none disabled:opacity-60"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-purple-600 font-semibold hover:underline"
          >
            Register Now
          </button>
        </p>
      </div>
    </div>
  );
}