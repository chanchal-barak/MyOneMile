import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const username = form.username.trim();
    const name = form.name.trim();
    const email = form.email.trim();

    if (!username || !name || !email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post("/api/auth/register", {
        ...form,
        username,
        name,
        email,
        phone: form.phone.trim(),
      });

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid registration response from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      toast.success("Registered successfully!");
      navigate("/");
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err.message
      );

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (!err.response) {
        toast.error(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else if (status === 409) {
        toast.error(message || "An account with these details already exists.");
      } else if (status === 400 || status === 422) {
        toast.error(message || "Please check your registration details.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(message || "Registration failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-100 via-white to-purple-200 px-4 py-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="absolute left-6 top-6 text-gray-700 transition hover:text-purple-700"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Registration Card */}
      <div className="w-full max-w-md rounded-3xl border border-purple-200 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-purple-700">
          Create Account
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Join MyOneMile and make a difference in your community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Username *
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
              required
              maxLength={30}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Full Name *
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              maxLength={100}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email Address *
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password *
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-purple-600"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="birth"
              className="mb-1 block text-sm font-medium text-gray-600"
            >
              Date of Birth
            </label>

            <input
              id="birth"
              name="birth"
              type="date"
              value={form.birth}
              onChange={handleChange}
              autoComplete="bday"
              disabled={isSubmitting}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="mb-1 block text-sm font-medium text-gray-600"
            >
              Gender
            </label>

            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-lg font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-purple-700 hover:underline"
          >
            Login
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-gray-500">
          Your community. Your voice. One mile at a time.
        </p>
      </div>
    </main>
  );
}