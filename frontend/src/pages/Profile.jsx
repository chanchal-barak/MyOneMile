import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Monitor,
  Heart,
  Trash2,
  Bell,
  LogOut,
  Edit,
  Users,
  BookOpen,
  Flag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    communities: 0,
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  // Restore user from localStorage if necessary.
  useEffect(() => {
    if (user) return;

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        toast.error("Please login first");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Failed to restore user:", error);
      localStorage.removeItem("user");
      toast.error("Please log in again");
      navigate("/login", { replace: true });
    }
  }, [user, setUser, navigate]);

  // Fetch profile statistics from the deployed backend.
  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await api.get("/api/user/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          setStats((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Stats error:",
          err.response?.data || err.message
        );

        // Keep the page usable even if statistics cannot load.
        if (!err.response) {
          console.error("Unable to connect to the backend.");
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const getAvatar = () => {
    if (user?.avatar) return user.avatar;

    const gender = user?.gender?.toString().toLowerCase();

    if (gender === "female" || gender === "f") {
      return "https://cdn-icons-png.flaticon.com/512/4140/4140046.png";
    }

    if (gender === "male" || gender === "m") {
      return "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
    }

    return "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setShowLogoutModal(false);

    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in again");
      setShowDeleteModal(false);
      navigate("/login", { replace: true });
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete("/api/user/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
      setShowDeleteModal(false);

      toast.success("Account deleted successfully!");
      navigate("/signup", { replace: true });
    } catch (err) {
      console.error(
        "Account deletion error:",
        err.response?.data || err.message
      );

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (!err.response) {
        toast.error("Unable to connect to the server. Please try again.");
      } else if (status === 401 || status === 403) {
        toast.error("Your session may have expired. Please log in again.");
      } else {
        toast.error(message || "Failed to delete account");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 text-gray-900 flex flex-col items-center px-6 py-10">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-purple-600 hover:text-purple-800 font-medium transition"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-10"
      >
        <motion.div
          className="relative w-32 h-32 mx-auto mb-4"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={getAvatar()}
            alt="Profile avatar"
            className="w-full h-full rounded-full border-4 border-purple-400 object-cover shadow-lg"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
            }}
          />

          <motion.button
            type="button"
            onClick={() => navigate("/edit-profile")}
            whileHover={{ scale: 1.1 }}
            aria-label="Edit profile"
            className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 shadow-md transition"
          >
            <Edit size={14} />
          </motion.button>
        </motion.div>

        <h2 className="text-2xl font-extrabold text-purple-800">
          @{user.username}
        </h2>

        <p className="text-gray-500">{user.email}</p>

        {/* Profile Statistics */}
        <motion.div
          className="flex justify-center gap-4 sm:gap-8 mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            label="Posts"
            value={stats.posts ?? 0}
            icon={<BookOpen />}
          />

          <StatCard
            label="Likes"
            value={stats.likes ?? 0}
            icon={<Heart />}
          />

          <StatCard
            label="Communities"
            value={stats.communities ?? 0}
            icon={<Users />}
          />
        </motion.div>
      </motion.div>

      {/* Profile Options */}
      <motion.div
        className="mt-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="space-y-4">
          <ProfileRow
            icon={<Monitor size={20} />}
            label="My Posts"
            onClick={() => navigate("/myposts")}
          />

          <ProfileRow
            icon={<Heart size={20} />}
            label="My Likes"
            onClick={() => navigate("/mylikes")}
          />

          <ProfileRow
            icon={<Flag size={20} />}
            label="My Reports"
            onClick={() => navigate("/my-reports")}
          />

          {/* Notification Toggle */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Bell className="text-purple-500" size={20} />
              <span className="font-medium">Notifications</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notificationsOn}
              aria-label="Toggle notifications"
              onClick={() => setNotificationsOn((prev) => !prev)}
              className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${
                notificationsOn ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <motion.span
                className="block w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: notificationsOn ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </button>
          </div>

          <ProfileRow
            icon={<Trash2 size={20} />}
            label="Delete Account"
            onClick={() => setShowDeleteModal(true)}
          />

          <ProfileRow
            icon={<LogOut size={20} />}
            label="Log Out"
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-gray-400 mt-10"
      >
        MyOneMile · App Version 2.3
      </motion.p>

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutModal && (
          <Modal
            title="Log Out?"
            message="Are you sure you want to log out from your account?"
            confirmLabel="Log Out"
            confirmColor="purple"
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            title="Delete Account?"
            message="Are you sure? This action cannot be undone."
            confirmLabel={isDeleting ? "Deleting..." : "Delete"}
            confirmColor="red"
            onConfirm={handleDeleteAccount}
            onCancel={() => {
              if (!isDeleting) setShowDeleteModal(false);
            }}
            disabled={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileRow({ icon, label, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-full flex items-center justify-between border-b border-gray-200 pb-3 text-left text-gray-700 hover:text-purple-700 transition"
    >
      <span className="flex items-center gap-3">
        <span className="text-purple-500">{icon}</span>
        <span className="font-medium">{label}</span>
      </span>

      <span className="text-sm opacity-60">›</span>
    </motion.button>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/80 px-3 sm:px-4 py-3 rounded-xl shadow-md border border-purple-100 min-w-0"
    >
      <div className="flex justify-center mb-1 text-purple-500">
        {icon}
      </div>

      <p className="text-lg font-bold text-purple-700">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}

function Modal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  disabled = false,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !disabled) {
          onCancel();
        }
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="bg-white p-6 rounded-2xl w-full max-w-xs text-center shadow-2xl border-t-4"
        style={{
          borderColor: confirmColor === "red" ? "#EF4444" : "#7C3AED",
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h2
          id="profile-modal-title"
          className="text-lg font-semibold text-gray-800 mb-2"
        >
          {title}
        </h2>

        <p className="text-gray-500 mb-5 text-sm">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={`px-4 py-2 text-white rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed ${
              confirmColor === "red"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {confirmLabel}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}