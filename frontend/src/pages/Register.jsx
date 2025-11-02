import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    birth: "",
    gender: "",
  });

  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-purple-100 relative">
      {/* --- Back Button --- */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-purple-600 hover:text-purple-800 font-medium"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      {/* --- Signup Box --- */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-purple-100">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            type="text"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          {/* Email */}
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          {/* Password */}
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          {/* Phone */}
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            type="text"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Date of Birth
            </label>
            <input
              name="birth"
              value={form.birth}
              onChange={handleChange}
              type="date"
              className="w-full border border-purple-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-purple-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-purple-600 font-semibold hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}




