
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import api from "../api/axios";

const BACKEND_URL = "https://myonemile.onrender.com";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [userDislikes, setUserDislikes] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [deleteIssueId, setDeleteIssueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingIssue, setDeletingIssue] = useState(false);

  const user = getStoredUser();
  const userId = user?._id;
  const token = localStorage.getItem("token");

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/issues");
      const all = Array.isArray(res.data) ? res.data : [];
      setIssues(all);

      const likesMap = {};
      const dislikesMap = {};

      all.forEach((issue) => {
        if (userId && issue.likes?.some((id) => String(id?._id ?? id) === String(userId))) {
          likesMap[issue._id] = true;
        }

        if (userId && issue.dislikes?.some((id) => String(id?._id ?? id) === String(userId))) {
          dislikesMap[issue._id] = true;
        }
      });

      setUserLikes(likesMap);
      setUserDislikes(dislikesMap);
    } catch (err) {
      console.error("Fetch issues error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load issues. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("issueUpdated", (updatedIssue) => {
      if (!updatedIssue?._id) return;

      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === updatedIssue._id
            ? updatedIssue
            : issue
        )
      );
    });

    return () => {
      socket.off("issueUpdated");
      socket.disconnect();
    };
  }, []);

  const handleLike = async (id) => {
    if (!token || !userId) {
      setActionError("Please log in to like an issue.");
      return;
    }

    const issue = issues.find((item) => item._id === id);
    if (!issue) return;

    const wasLiked = Boolean(userLikes[id]);
    const previousIssues = issues;
    const previousLikes = userLikes;
    const previousDislikes = userDislikes;

    setActionError("");

    setIssues((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;

        const likes = Array.isArray(item.likes) ? item.likes : [];
        const dislikes = Array.isArray(item.dislikes) ? item.dislikes : [];

        return {
          ...item,
          likes: wasLiked
            ? likes.filter((uid) => String(uid?._id ?? uid) !== String(userId))
            : [...likes.filter((uid) => String(uid?._id ?? uid) !== String(userId)), userId],
          dislikes: dislikes.filter(
            (uid) => String(uid?._id ?? uid) !== String(userId)
          ),
        };
      })
    );

    setUserLikes((prev) => ({ ...prev, [id]: !wasLiked }));
    setUserDislikes((prev) => ({ ...prev, [id]: false }));

    try {
      await api.put(`/api/issues/${id}/like`);
    } catch (err) {
      console.error("Like error:", err);
      setIssues(previousIssues);
      setUserLikes(previousLikes);
      setUserDislikes(previousDislikes);
      setActionError(
        err.response?.data?.message || "Could not update your like."
      );
    }
  };

  const handleDislike = async (id) => {
    if (!token || !userId) {
      setActionError("Please log in to dislike an issue.");
      return;
    }

    const issue = issues.find((item) => item._id === id);
    if (!issue) return;

    const wasDisliked = Boolean(userDislikes[id]);
    const previousIssues = issues;
    const previousLikes = userLikes;
    const previousDislikes = userDislikes;

    setActionError("");

    setIssues((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;

        const likes = Array.isArray(item.likes) ? item.likes : [];
        const dislikes = Array.isArray(item.dislikes) ? item.dislikes : [];

        return {
          ...item,
          dislikes: wasDisliked
            ? dislikes.filter(
                (uid) => String(uid?._id ?? uid) !== String(userId)
              )
            : [
                ...dislikes.filter(
                  (uid) => String(uid?._id ?? uid) !== String(userId)
                ),
                userId,
              ],
          likes: likes.filter(
            (uid) => String(uid?._id ?? uid) !== String(userId)
          ),
        };
      })
    );

    setUserDislikes((prev) => ({ ...prev, [id]: !wasDisliked }));
    setUserLikes((prev) => ({ ...prev, [id]: false }));

    try {
      await api.put(`/api/issues/${id}/dislike`);
    } catch (err) {
      console.error("Dislike error:", err);
      setIssues(previousIssues);
      setUserLikes(previousLikes);
      setUserDislikes(previousDislikes);
      setActionError(
        err.response?.data?.message || "Could not update your dislike."
      );
    }
  };

  const confirmDelete = (id) => {
    setActionError("");
    setDeleteIssueId(id);
  };

  const handleDelete = async () => {
    if (!deleteIssueId || !token) {
      setActionError("Please log in to delete an issue.");
      return;
    }

    setDeletingIssue(true);
    setActionError("");

    try {
      await api.delete(`/api/issues/${deleteIssueId}`);

      setIssues((prev) =>
        prev.filter((issue) => issue._id !== deleteIssueId)
      );
      setDeleteIssueId(null);
    } catch (err) {
      console.error("Delete issue error:", err);
      setActionError(
        err.response?.data?.message || "Could not delete this issue."
      );
    } finally {
      setDeletingIssue(false);
    }
  };

  const openComments = async (issue) => {
    setSelectedIssue(issue);
    setComments([]);
    setNewComment("");
    setActionError("");

    try {
      const res = await api.get(`/api/issues/${issue._id}/comments`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch comments error:", err);
      setActionError(
        err.response?.data?.message || "Unable to load comments."
      );
    }
  };

  const handleAddComment = async () => {
    if (!token || !userId) {
      setActionError("Please log in to add a comment.");
      return;
    }

    if (!selectedIssue || !newComment.trim()) return;

    setSubmittingComment(true);
    setActionError("");

    try {
      const res = await api.post(
        `/api/issues/${selectedIssue._id}/comment`,
        { text: newComment.trim() }
      );

      const created = res.data;

      if (Array.isArray(created)) {
        setComments(created);
      } else if (created) {
        setComments((prev) => [...prev, created]);
      } else {
        const refreshed = await api.get(
          `/api/issues/${selectedIssue._id}/comments`
        );
        setComments(Array.isArray(refreshed.data) ? refreshed.data : []);
      }

      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
      setActionError(
        err.response?.data?.message || "Could not post your comment."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteCommentDirect = async (commentId) => {
    if (!token || !selectedIssue) {
      setActionError("Please log in to delete a comment.");
      return;
    }

    setActionError("");

    try {
      await api.delete(
        `/api/issues/${selectedIssue._id}/comment/${commentId}`
      );

      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error("Delete comment error:", err);
      setActionError(
        err.response?.data?.message || "Could not delete this comment."
      );
    }
  };

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{
        background: "linear-gradient(120deg, #fff8ff, #f3e5ff, #ffffff)",
      }}
    >
      <div className="space-y-4 max-w-3xl mx-auto">
        {actionError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-500">Loading issues...</p>
        )}

        {!loading && error && (
          <div className="text-center space-y-3">
            <p role="alert" className="text-red-600">{error}</p>
            <button
              onClick={fetchIssues}
              className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <p className="text-center text-gray-500">No issues found.</p>
        )}

        {issues.map((issue) => (
          <motion.div
            key={issue._id}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-lg border border-purple-100 overflow-hidden bg-white"
          >
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="flex-1 p-4">
                <p className="text-purple-600 font-semibold text-sm">
                  {issue.user?.name || "Anonymous"}
                </p>
                <h3 className="font-bold text-gray-900 text-lg">
                  {issue.title}
                </h3>
                <p className="text-gray-600 text-sm">{issue.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  📍 {issue.location}
                </p>
              </div>

              {issue.image && (
                <div className="w-full md:w-1/3">
                  <img
                    src={issue.image}
                    alt={issue.title || "Issue"}
                    className="w-full h-48 md:h-full object-cover md:rounded-l-none rounded-b-2xl md:rounded-r-2xl"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-2 py-3 px-4 bg-purple-50">
              <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                  type="button"
                  whileTap={{ scale: 1.15 }}
                  onClick={() => handleLike(issue._id)}
                  aria-label="Like issue"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    userLikes[issue._id]
                      ? "bg-purple-200 text-purple-700"
                      : "text-gray-600 hover:bg-purple-100"
                  }`}
                >
                  {userLikes[issue._id] ? "💜" : "🤍"}{" "}
                  {issue.likes?.length || 0}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 1.15 }}
                  onClick={() => handleDislike(issue._id)}
                  aria-label="Dislike issue"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    userDislikes[issue._id]
                      ? "bg-red-200 text-red-700"
                      : "text-gray-600 hover:bg-red-100"
                  }`}
                >
                  {userDislikes[issue._id] ? "👎" : "👎🏻"}{" "}
                  {issue.dislikes?.length || 0}
                </motion.button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => openComments(issue)}
                  className="px-3 sm:px-4 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm"
                >
                  💬 Comments
                </button>

                {String(issue.user?._id ?? issue.user) === String(userId) && (
                  <button
                    type="button"
                    onClick={() => confirmDelete(issue._id)}
                    className="px-3 sm:px-4 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-sm"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DELETE ISSUE MODAL */}
      <AnimatePresence>
        {deleteIssueId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-issue-title"
              className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center"
            >
              <h3
                id="delete-issue-title"
                className="text-xl text-red-600 font-semibold"
              >
                Delete Issue?
              </h3>
              <p className="text-gray-600 mt-2 mb-5">
                This action cannot be undone.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  disabled={deletingIssue}
                  onClick={() => setDeleteIssueId(null)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deletingIssue}
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingIssue ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENTS MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="comments-title"
            className="bg-white rounded-xl p-6 max-w-md w-full relative shadow-xl"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedIssue(null);
                setComments([]);
                setNewComment("");
                setActionError("");
              }}
              aria-label="Close comments"
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h3
              id="comments-title"
              className="font-semibold text-purple-700 mb-3 text-lg pr-6"
            >
              Comments on {selectedIssue.title}
            </h3>

            <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
              {comments.length ? (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex justify-between items-start"
                  >
                    <div className="pr-3 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">
                        {comment.user?.name || "User"}
                      </p>
                      <p className="text-gray-700 text-sm break-words">
                        {comment.text}
                      </p>
                    </div>

                    {(String(comment.user?._id ?? comment.user) === String(userId) ||
                      String(selectedIssue.user?._id ?? selectedIssue.user) === String(userId)) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCommentDirect(comment._id)}
                        aria-label="Delete comment"
                        className="ml-3 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs hover:bg-red-200 transition"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm">
                  No comments yet
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddComment();
                }}
                placeholder="Write a comment..."
                aria-label="Write a comment"
                className="flex-1 min-w-0 border border-purple-300 rounded-lg px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={handleAddComment}
                disabled={submittingComment || !newComment.trim()}
                className="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submittingComment ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
