
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    birth: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        birth: user.birth ? user.birth.split("T")[0] : "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to update your profile.");
      navigate("/login");
      return;
    }

    if (!form.name.trim() || !form.username.trim() || !form.email.trim()) {
      toast.error("Name, username, and email are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.put("/api/user/update-profile", {
        ...form,
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      const updatedUser = res.data?.user;

      if (!updatedUser) {
        throw new Error("The server did not return the updated user.");
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Update profile error:", err);

      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (status === 401
          ? "Your session has expired. Please log in again."
          : status === 409
          ? "That username or email may already be in use."
          : "Failed to update profile. Please try again.");

      toast.error(message);

      if (status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvatar = () => {
    const gender = form.gender?.toLowerCase();

    if (gender === "female") {
      return "https://cdn-icons-png.flaticon.com/512/4140/4140046.png";
    }

    if (gender === "male") {
      return "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
    }

    return "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex flex-col items-center px-6 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-purple-600 hover:text-purple-800 transition"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 w-full max-w-md mt-16 border border-purple-100"
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={getAvatar()}
              alt="Profile avatar"
              className="w-24 h-24 rounded-full border-4 border-purple-400 object-cover shadow-md"
            />

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="absolute bottom-1 right-1 bg-purple-600 p-2 rounded-full text-white"
            >
              <User size={14} />
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-purple-800 mb-4">
            Edit Profile
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <InputField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <InputField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
          />

          <InputField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <InputField
            label="Birth Date"
            name="birth"
            value={form.birth}
            onChange={handleChange}
            type="date"
          />

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Gender
            </label>

            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <button
          type="button"
          className="flex items-center justify-center gap-2 mt-4 w-full bg-gray-200 py-2 rounded-xl hover:bg-gray-300 transition text-gray-700 font-medium"
          onClick={() => toast("Password change coming soon 🔒")}
        >
          <Lock size={16} />
          Change Password
        </button>
      </motion.div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-600 mb-1"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );
}
