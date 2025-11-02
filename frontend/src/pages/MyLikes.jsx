import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Heart, Loader2, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";

export default function MyLikes() {
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/user/mylikes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiked();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 px-6 py-8 transition-all duration-500">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-purple-600 mb-6 hover:text-purple-800 transition"
      >
        <ArrowLeft className="mr-2 w-5 h-5" /> Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-purple-700 mb-8 text-center">
        Posts I Liked
      </h1>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="animate-spin text-purple-600" size={36} />
        </div>
      ) : liked.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486742.png"
            alt="Empty"
            className="w-32 mb-4 opacity-90"
          />
          <p className="text-gray-600 text-lg">
            You haven’t liked any posts yet.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {liked.map((issue, index) => (
            <motion.div
              key={issue._id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => navigate(`/issues/${issue._id}`)}
              className="cursor-pointer bg-gradient-to-br from-purple-50 to-purple-200 shadow-md rounded-2xl p-5 border border-purple-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg text-purple-900 mb-2">
                  {issue.title}
                </h2>
                <Heart
                  size={20}
                  className="text-red-500 fill-red-500 group-hover:scale-110 transition-transform"
                />
              </div>

              <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                {issue.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{issue.location || "Unknown"}</span>
                </div>
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

