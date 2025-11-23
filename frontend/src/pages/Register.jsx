// frontend/src/pages/Register.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    birth: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", form);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      toast.success("Registered successfully!");
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-purple-100 relative">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6">
        <ArrowLeft size={20} />
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-purple-100">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required className="..." />
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="..." />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="..." />

          <div className="relative">
            <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type={showPassword ? "text" : "password"} required className="..." />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-2.5">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
          <div>
            <label>Date of Birth</label>
            <input name="birth" value={form.birth} onChange={handleChange} type="date" />
          </div>
          <div>
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg">Sign Up</button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <span onClick={() => navigate("/login")} className="text-purple-600">Login</span>
        </p>
      </div>
    </div>
  );
}
