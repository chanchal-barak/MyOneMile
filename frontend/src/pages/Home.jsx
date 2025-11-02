import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [userDislikes, setUserDislikes] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const BACKEND_URL = "http://localhost:4000";

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
      const all = res.data;
      setIssues(all);

      const likesMap = {};
      const dislikesMap = {};
      all.forEach((issue) => {
        if (issue.likes?.includes(user?._id)) likesMap[issue._id] = true;
        if (issue.dislikes?.includes(user?._id))
          dislikesMap[issue._id] = true;
      });
      setUserLikes(likesMap);
      setUserDislikes(dislikesMap);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [user?._id]);

  const handleLike = async (id) => {
    if (!token) return alert("Please login to like posts");

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
    if (!token) return alert("Please login to dislike posts");

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

  // 💬 Open comment modal
  const openComments = async (issue) => {
    try {
      setSelectedIssue(issue);
      const res = await axios.get(
        `${BACKEND_URL}/api/issues/${issue._id}/comments`
      );
      setComments(res.data || []); // Ensure comments array
    } catch (err) {
      console.error("Comment fetch error:", err);
    }
  };

  // ➕ Add new comment
  const handleAddComment = async () => {
    if (!token) return alert("Please login to comment");
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/issues/${selectedIssue._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  // 🏡 UI
  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{
        background: "linear-gradient(135deg, #f8f5ff 0%, #fff 100%)",
      }}
    >
      <div className="space-y-6">
        {issues.map((issue) => (
          <motion.div
            key={issue._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-purple-100 shadow hover:shadow-lg overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-2/3 p-4">
                <p className="text-purple-600 font-semibold">
                  {issue.user?.name || "Anonymous"}
                </p>
                <h3 className="font-bold text-gray-800">{issue.title}</h3>
                <p className="text-gray-600 text-sm">{issue.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  📍 {issue.location}
                </p>
              </div>

              {issue.image && (
                <div className="sm:w-1/3">
                  <img
                    src={`${BACKEND_URL}${issue.image}`} // ✅ FIXED — no extra slash
                    alt={issue.title}
                    className="w-full h-48 sm:h-full object-cover border-t sm:border-l border-purple-100"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* ACTIONS BAR */}
            <div className="flex justify-around items-center py-3 border-t border-purple-100 bg-purple-50/30">
              {/* LIKE */}
              <motion.button
                onClick={() => handleLike(issue._id)}
                whileTap={{ scale: 1.1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  userLikes[issue._id]
                    ? "bg-purple-100 text-purple-600 border border-purple-200"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <span className="text-lg">
                  {userLikes[issue._id] ? "💜" : "🤍"}
                </span>
                <span>{issue.likes?.length || 0}</span>
                <span className="hidden sm:inline">Likes</span>
              </motion.button>

              {/* DISLIKE */}
              <motion.button
                onClick={() => handleDislike(issue._id)}
                whileTap={{ scale: 1.1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  userDislikes[issue._id]
                    ? "bg-red-100 text-red-600 border border-red-200"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <span className="text-lg">
                  {userDislikes[issue._id] ? "👎" : "👎🏻"}
                </span>
                <span>{issue.dislikes?.length || 0}</span>
                <span className="hidden sm:inline">Dislikes</span>
              </motion.button>

              {/* COMMENTS */}
              <button
                onClick={() => openComments(issue)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all"
              >
                💬
                <span className="hidden sm:inline">Comments</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* COMMENT MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h3 className="font-semibold text-purple-700 mb-3">
              Comments on {selectedIssue.title}
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {comments.length > 0 ? (
                comments.map((c, i) => (
                  <div
                    key={`${c._id || i}`}
                    className="bg-purple-50 border border-purple-100 rounded p-2"
                  >
                    <p className="text-purple-700 font-medium">
                      {c.user?.name || "User"}
                    </p>
                    <p className="text-sm">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center">
                  No comments yet
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-purple-300 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleAddComment}
                className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700"
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

