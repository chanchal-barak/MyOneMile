import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useUser } from "../context/UserContext";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (isMounted) {
            toast.error("Please log in to view your reported issues.");
          }
          return;
        }

        const response = await api.get("/api/user/myposts");

        if (isMounted) {
          setPosts(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);

        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load your reported issues."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId || deleting) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in again to delete this issue.");
      return;
    }

    const deletedPost = posts.find((post) => post._id === deleteId);

    if (!deletedPost) {
      setDeleteId(null);
      return;
    }

    setDeleting(true);

    try {
      await api.delete(`/api/issues/${encodeURIComponent(deleteId)}`);

      setPosts((previousPosts) =>
        previousPosts.filter((post) => post._id !== deleteId)
      );

      setExpandedId((currentId) =>
        currentId === deleteId ? null : currentId
      );

      setRecentlyDeleted(deletedPost);
      setDeleteId(null);

      toast.success("Issue deleted successfully.");
    } catch (error) {
      console.error("Failed to delete issue:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete this issue."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleUndo = async () => {
    if (!recentlyDeleted || undoing) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in again to restore this issue.");
      return;
    }

    setUndoing(true);

    try {
      await api.post("/api/issues", recentlyDeleted);

      setPosts((previousPosts) => {
        const alreadyExists = previousPosts.some(
          (post) => post._id === recentlyDeleted._id
        );

        if (alreadyExists) return previousPosts;

        return [recentlyDeleted, ...previousPosts];
      });

      setRecentlyDeleted(null);
      toast.success("Issue restored successfully.");
    } catch (error) {
      console.error("Undo failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Could not restore the issue. Please try again."
      );
    } finally {
      setUndoing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 px-6 py-8 transition-all duration-500">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-purple-600 mb-6 hover:text-purple-800 transition"
      >
        <ArrowLeft className="mr-2 w-5 h-5" />
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-purple-700 mb-8 text-center">
        My Reported Issues
      </h1>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="animate-spin text-purple-600" size={36} />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486750.png"
            alt="No reported issues"
            className="w-32 mb-4 opacity-90"
          />
          <p className="text-gray-600 text-lg">
            You haven&apos;t reported any issues yet.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((issue, index) => (
            <motion.div
              key={issue._id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gradient-to-br from-purple-50 to-purple-200 shadow-md rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <button
                type="button"
                className="w-full text-left cursor-pointer p-5 flex justify-between items-start gap-3"
                onClick={() => toggleExpand(issue._id)}
                aria-expanded={expandedId === issue._id}
              >
                <div className="min-w-0">
                  <h2 className="font-bold text-lg text-purple-900 mb-1">
                    {issue.title || "Untitled issue"}
                  </h2>

                  <p className="text-gray-700 text-sm line-clamp-2">
                    {issue.description || "No description provided."}
                  </p>
                </div>

                {expandedId === issue._id ? (
                  <ChevronUp className="text-purple-600 shrink-0" />
                ) : (
                  <ChevronDown className="text-purple-600 shrink-0" />
                )}
              </button>

              {/* Expanded Section */}
              <AnimatePresence>
                {expandedId === issue._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 space-y-3 border-t border-purple-100 bg-white/70"
                  >
                    {issue.image && (
                      <img
                        src={issue.image}
                        alt={issue.title || "Reported issue"}
                        className="rounded-lg w-full h-48 object-cover border border-purple-100"
                      />
                    )}

                    <p className="text-gray-800 text-sm">
                      {issue.description || "No description provided."}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{issue.location || "Unknown location"}</span>
                      </div>

                      <span>
                        {issue.createdAt &&
                        !Number.isNaN(new Date(issue.createdAt).getTime())
                          ? new Date(issue.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => confirmDelete(issue._id)}
                        className="flex items-center gap-2 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            onClick={() => !deleting && setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(event) => event.stopPropagation()}
              className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Confirm Deletion
              </h3>

              <p className="text-gray-500 mb-4">
                Are you sure you want to delete this issue?
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting && <Loader2 size={16} className="animate-spin" />}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Snackbar */}
      <AnimatePresence>
        {recentlyDeleted && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-40"
          >
            <span>Issue deleted</span>

            <button
              type="button"
              onClick={handleUndo}
              disabled={undoing}
              className="bg-white text-purple-600 px-3 py-1 rounded-full font-medium hover:bg-purple-100 disabled:opacity-50"
            >
              {undoing ? "Restoring..." : "Undo"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}