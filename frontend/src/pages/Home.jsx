import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [userDislikes, setUserDislikes] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [deleteIssueId, setDeleteIssueId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const BACKEND_URL = "https://myonemile.onrender.com";

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ["websocket"] });
    socket.on("issueUpdated", (updatedIssue) => {
      setIssues((prev) =>
        prev.map((i) => (i._id === updatedIssue._id ? updatedIssue : i))
      );
    });
    return () => socket.disconnect();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/issues`);
      const all = res.data || [];
      setIssues(all);

      const likesMap = {};
      const dislikesMap = {};

      all.forEach((issue) => {
        if (issue.likes?.includes(user?._id)) likesMap[issue._id] = true;
        if (issue.dislikes?.includes(user?._id)) dislikesMap[issue._id] = true;
      });

      setUserLikes(likesMap);
      setUserDislikes(dislikesMap);
    } catch (err) {
      console.error("Fetch issues error:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [user?._id]);

  const handleLike = async (id) => {
    if (!token) return;
    try {
      setIssues((prev) =>
        prev.map((i) =>
          i._id === id
            ? {
                ...i,
                likes: userLikes[id]
                  ? i.likes.filter((uid) => uid !== user._id)
                  : [...i.likes, user._id],
                dislikes: i.dislikes.filter((uid) => uid !== user._id),
              }
            : i
        )
      );

      setUserLikes((prev) => ({ ...prev, [id]: !prev[id] }));
      setUserDislikes((prev) => ({ ...prev, [id]: false }));

      await axios.put(
        `${BACKEND_URL}/api/issues/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDislike = async (id) => {
    if (!token) return;
    try {
      setIssues((prev) =>
        prev.map((i) =>
          i._id === id
            ? {
                ...i,
                dislikes: userDislikes[id]
                  ? i.dislikes.filter((uid) => uid !== user._id)
                  : [...i.dislikes, user._id],
                likes: i.likes.filter((uid) => uid !== user._id),
              }
            : i
        )
      );

      setUserDislikes((prev) => ({ ...prev, [id]: !prev[id] }));
      setUserLikes((prev) => ({ ...prev, [id]: false }));

      await axios.put(
        `${BACKEND_URL}/api/issues/${id}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Dislike error:", err);
    }
  };

  const confirmDelete = (id) => setDeleteIssueId(id);

  const handleDelete = async () => {
    if (!deleteIssueId || !token) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/issues/${deleteIssueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIssues((prev) => prev.filter((i) => i._id !== deleteIssueId));
      setDeleteIssueId(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openComments = async (issue) => {
    try {
      setSelectedIssue(issue);
      const res = await axios.get(
        `${BACKEND_URL}/api/issues/${issue._id}/comments`
      );
      setComments(res.data || []);
    } catch (err) {
      console.error("Comment fetch error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/issues/${selectedIssue._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If API returns the created comment
      const created = res.data;

      if (Array.isArray(created)) {
        setComments(created);
      } else {
        setComments((prev) => [...prev, created]);
      }

      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const handleDeleteCommentDirect = async (commentId) => {
    try {
      await axios.delete(
        `${BACKEND_URL}/api/issues/${selectedIssue._id}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ background: "linear-gradient(120deg, #fff8ff, #f3e5ff, #ffffff)" }}
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        {issues.length === 0 && (
          <p className="text-center text-gray-500">No issues found.</p>
        )}

        {issues.map((issue) => (
          <motion.div
            key={issue._id}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-lg border border-purple-100 overflow-hidden bg-white"
          >
            {/* TEXT + IMAGE → IMAGE ON RIGHT SIDE */}
            <div className="flex flex-col md:flex-row items-stretch">

              {/* LEFT SIDE TEXT */}
              <div className="flex-1 p-4">
                <p className="text-purple-600 font-semibold text-sm">
                  {issue.user?.name || "Anonymous"}
                </p>
                <h3 className="font-bold text-gray-900 text-lg">{issue.title}</h3>
                <p className="text-gray-600 text-sm">{issue.description}</p>
                <p className="text-xs text-gray-400 mt-1">📍 {issue.location}</p>
              </div>

              {/* RIGHT SIDE IMAGE */}
              {issue.image && (
                <div className="w-full md:w-1/3">
                  <img
                    src={issue.image}
                    alt="issue"
                    className="w-full h-48 md:h-full object-cover md:rounded-l-none rounded-b-2xl md:rounded-r-2xl"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-between items-center py-3 px-4 bg-purple-50">

              {/* LIKE + DISLIKE */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 1.15 }}
                  onClick={() => handleLike(issue._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    userLikes[issue._id]
                      ? "bg-purple-200 text-purple-700"
                      : "text-gray-600 hover:bg-purple-100"
                  }`}
                >
                  {userLikes[issue._id] ? "💜" : "🤍"} {issue.likes?.length || 0}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 1.15 }}
                  onClick={() => handleDislike(issue._id)}
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

              {/* COMMENTS + DELETE */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openComments(issue)}
                  className="px-4 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                >
                  💬 Comments
                </button>

                {issue.user?._id === user?._id && (
                  <button
                    onClick={() => confirmDelete(issue._id)}
                    className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
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
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center"
            >
              <h3 className="text-xl text-red-600 font-semibold">
                Delete Issue?
              </h3>
              <p className="text-gray-600 mt-2 mb-5">
                This action cannot be undone.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteIssueId(null)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENTS MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative shadow-xl">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h3 className="font-semibold text-purple-700 mb-3 text-lg">
              Comments on {selectedIssue.title}
            </h3>

            {/* COMMENT LIST */}
            <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
              {comments.length ? (
                comments.map((c) => (
                  <div
                    key={c._id}
                    className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex justify-between items-start"
                  >
                    <div className="pr-3">
                      <p className="font-semibold text-gray-800 text-sm">
                        {c.user?.name || "User"}
                      </p>
                      <p className="text-gray-700 text-sm">{c.text}</p>
                    </div>

                    {/* DELETE COMMENT BUTTON WITH DUSTBIN */}
                    {(c.user?._id === user?._id ||
                      selectedIssue.user?._id === user?._id) && (
                      <button
                        onClick={() => handleDeleteCommentDirect(c._id)}
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

            {/* ADD COMMENT */}
            <div className="flex gap-2 mt-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-purple-300 rounded-lg px-3 py-2 text-sm"
              />

              <button
                onClick={handleAddComment}
                className="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
