import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, User } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

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
    avatar: "",
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        birth: user.birth ? user.birth.split("T")[0] : "",
        gender: user.gender || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // NEW --- Change Avatar Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:4000/api/user/update-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(res.data.user);
      setForm((prev) => ({ ...prev, avatar: res.data.user.avatar }));

      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Avatar upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:4000/api/user/update-profile",
        {
          name: form.name,
          username: form.username,
          email: form.email,
          phone: form.phone,
          birth: form.birth,
          gender: form.gender,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Keep avatar safe
      const updatedUser = { ...res.data.user, avatar: user.avatar };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated!");

      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex flex-col items-center px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-purple-600 hover:text-purple-800 transition"
      >
        <ArrowLeft size={20} className="mr-1" /> Back
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
              src={form.avatar || user?.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-purple-400 object-cover shadow-md"
            />

            {/* Change Avatar Button */}
            <label className="absolute bottom-1 right-1 bg-purple-600 p-2 rounded-full text-white cursor-pointer">
              <User size={14} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <h2 className="text-xl font-bold text-purple-800 mb-4">
            Edit Profile
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} />
          <InputField label="Username" name="username" value={form.username} onChange={handleChange} />

          <InputField type="email" label="Email" name="email" value={form.email} onChange={handleChange} />
          <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />

          <InputField
            type="date"
            label="Birth Date"
            name="birth"
            value={form.birth}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
            <select
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
            className="w-full mt-4 bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Save Changes
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );
}
