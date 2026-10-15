import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useUser } from "../context/UserContext";

export default function MyLikes() {
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    let isMounted = true;

    const fetchLiked = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (isMounted) {
            setLiked([]);
            toast.error("Please log in to view your liked posts.");
          }
          return;
        }

        const response = await api.get("/api/user/mylikes");

        if (isMounted) {
          setLiked(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch liked posts:", error);

        if (isMounted) {
          setLiked([]);
          toast.error(
            error.response?.data?.message ||
              "Failed to load your liked posts."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLiked();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 px-6 py-8 transition-all duration-500">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center text-purple-600 mb-6 hover:text-purple-800 transition"
      >
        <ArrowLeft className="mr-2 w-5 h-5" />
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-purple-700 mb-8 text-center">
        Posts I Liked
      </h1>

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2
            className="animate-spin text-purple-600"
            size={36}
          />
        </div>
      ) : liked.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486742.png"
            alt="No liked posts"
            className="w-32 mb-4 opacity-90"
          />

          <p className="text-gray-600 text-lg">
            You haven&apos;t liked any posts yet.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {liked.map((issue, index) => (
            <motion.button
              type="button"
              key={issue._id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedIssue(issue)}
              className="w-full text-left cursor-pointer bg-gradient-to-br from-purple-50 to-purple-200 shadow-md rounded-2xl p-5 border border-purple-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start gap-3">
                <h2 className="font-bold text-lg text-purple-900 mb-2">
                  {issue.title || "Untitled issue"}
                </h2>

                <Heart
                  size={20}
                  className="text-red-500 fill-red-500 group-hover:scale-110 transition-transform shrink-0"
                />
              </div>

              <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                {issue.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">
                    {issue.location || "Unknown"}
                  </span>
                </div>

                <span className="shrink-0">
                  {issue.createdAt &&
                  !Number.isNaN(new Date(issue.createdAt).getTime())
                    ? new Date(issue.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="liked-issue-title"
              className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-white"
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                aria-label="Close issue details"
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <div className="flex items-start justify-between gap-4 mb-4 pr-6">
                <h2
                  id="liked-issue-title"
                  className="text-2xl font-bold text-purple-900"
                >
                  {selectedIssue.title || "Untitled issue"}
                </h2>

                <Heart
                  className="text-red-500 fill-red-500 shrink-0"
                  size={22}
                />
              </div>

              {selectedIssue.image && (
                <img
                  src={selectedIssue.image}
                  alt={selectedIssue.title || "Reported issue"}
                  className="w-full max-h-72 object-cover rounded-xl mb-4"
                />
              )}

              <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {selectedIssue.description || "No description provided."}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>
                    {selectedIssue.location || "Unknown location"}
                  </span>
                </div>

                {selectedIssue.createdAt &&
                  !Number.isNaN(
                    new Date(selectedIssue.createdAt).getTime()
                  ) && (
                    <span>
                      {new Date(
                        selectedIssue.createdAt
                      ).toLocaleString()}
                    </span>
                  )}

                {selectedIssue.category && (
                  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                    {selectedIssue.category}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}