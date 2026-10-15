
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const dailyQuestions = [
  "Start a conversation… What change do you want to see?",
  "Raise your voice. What’s happening around you?",
  "Let’s talk about something that matters.",
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

const getLikedFlag = (post, userId) => {
  if (!userId || !Array.isArray(post.likedBy)) return false;

  return post.likedBy.some((id) => getId(id) === getId(userId));
};

const normalizePost = (post, userId) => ({
  ...post,
  likes: Number(post.likes) || 0,
  likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
  comments: Array.isArray(post.comments) ? post.comments : [],
  liked: typeof post.liked === "boolean"
    ? post.liked
    : getLikedFlag(post, userId),
});

export default function Discussion() {
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = getId(user?._id);

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [deletePost, setDeletePost] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [creating, setCreating] = useState(false);
  const [likingId, setLikingId] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState("");

  const [question] = useState(() => {
    const index = new Date().getDate() % dailyQuestions.length;
    return dailyQuestions[index];
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDiscussions = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const res = await axios.get("/discussions");
        const data = Array.isArray(res.data) ? res.data : [];

        if (!cancelled) {
          setPosts(data.map((post) => normalizePost(post, userId)));
        }
      } catch (err) {
        console.error("Error fetching discussions:", err);

        if (!cancelled) {
          setLoadError(
            err.response?.data?.message ||
              "Unable to load discussions. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDiscussions();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleCreate = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const content = newPost.trim();
    if (!content || creating) return;

    setCreating(true);

    try {
      const res = await axios.post("/discussions", { content });
      const createdPost = normalizePost(
        {
          ...res.data,
          user: res.data?.user || user,
          likes: res.data?.likes ?? 0,
          likedBy: res.data?.likedBy ?? [],
          comments: res.data?.comments ?? [],
        },
        userId
      );

      setPosts((prev) => [
        createdPost,
        ...prev.filter((post) => getId(post._id) !== getId(createdPost._id)),
      ]);

      setNewPost("");
      setShowNewPostModal(false);
    } catch (err) {
      console.error("Error creating discussion:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Please log in again to start a discussion.");
        navigate("/login");
      } else {
        alert(
          err.response?.data?.message ||
            "Could not create your discussion. Please try again."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (likingId) return;
    setLikingId(getId(id));

    try {
      const res = await axios.post(`/discussions/${id}/like`);

      setPosts((prev) =>
        prev.map((post) =>
          getId(post._id) === getId(id)
            ? normalizePost(
                {
                  ...post,
                  likes: res.data?.likes ?? post.likes,
                  liked:
                    typeof res.data?.liked === "boolean"
                      ? res.data.liked
                      : !post.liked,
                },
                userId
              )
            : post
        )
      );

      setSelectedPost((prev) =>
        prev && getId(prev._id) === getId(id)
          ? normalizePost(
              {
                ...prev,
                likes: res.data?.likes ?? prev.likes,
                liked:
                  typeof res.data?.liked === "boolean"
                    ? res.data.liked
                    : !prev.liked,
              },
              userId
            )
          : prev
      );
    } catch (err) {
      console.error("Error liking discussion:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        alert(
          err.response?.data?.message ||
            "Could not update your like. Please try again."
        );
      }
    } finally {
      setLikingId("");
    }
  };

  const askDeletePost = (post) => {
    setDeletePost(post);
  };

  const cancelDelete = () => {
    if (!deletingPost) setDeletePost(null);
  };

  const confirmDeletePost = async () => {
    if (!user || !deletePost || deletingPost) return;

    setDeletingPost(true);

    try {
      await axios.delete(`/discussions/${deletePost._id}`);

      setPosts((prev) =>
        prev.filter(
          (post) => getId(post._id) !== getId(deletePost._id)
        )
      );

      setSelectedPost((prev) =>
        prev && getId(prev._id) === getId(deletePost._id) ? null : prev
      );

      setCommentText("");
      setDeletePost(null);
    } catch (err) {
      console.error("Error deleting discussion:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        alert(
          err.response?.data?.message ||
            "Could not delete the discussion. Please try again."
        );
      }
    } finally {
      setDeletingPost(false);
    }
  };

  const openCommentsModal = (post) => {
    setSelectedPost(post);
    setCommentText("");
  };

  const closeCommentsModal = () => {
    if (addingComment || deletingCommentId) return;
    setSelectedPost(null);
    setCommentText("");
  };

  const updatePostInState = (updatedPost) => {
    const normalized = normalizePost(updatedPost, userId);

    setPosts((prev) =>
      prev.map((post) =>
        getId(post._id) === getId(normalized._id) ? normalized : post
      )
    );

    setSelectedPost((prev) =>
      prev && getId(prev._id) === getId(normalized._id)
        ? normalized
        : prev
    );
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const content = commentText.trim();
    if (!content || !selectedPost || addingComment) return;

    setAddingComment(true);

    try {
      const res = await axios.post(
        `/discussions/${selectedPost._id}/comments`,
        { content }
      );

      updatePostInState(res.data);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        alert(
          err.response?.data?.message ||
            "Could not add your comment. Please try again."
        );
      }
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (deletingCommentId) return;
    setDeletingCommentId(getId(commentId));

    try {
      const res = await axios.delete(
        `/discussions/${postId}/comments/${commentId}`
      );

      updatePostInState(res.data);
    } catch (err) {
      console.error("Error deleting comment:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        alert(
          err.response?.data?.message ||
            "Could not delete the comment. Please try again."
        );
      }
    } finally {
      setDeletingCommentId("");
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 px-5 py-10">
      <div className="mx-auto mb-4 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-semibold text-orange-600"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <h1 className="mb-5 text-center text-3xl font-bold text-orange-700">
        Discussion Starter 💬
      </h1>

      <div className="mx-auto mb-8 max-w-3xl rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white">
        <h2 className="text-lg font-semibold">Today’s Question</h2>
        <p className="italic">{question}</p>

        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1">
            #Environment
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1">
            #CommunityVoice
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1">
            #YouthAction
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5">
        {loading && (
          <p className="py-8 text-center text-gray-500">
            Loading discussions...
          </p>
        )}

        {!loading && loadError && (
          <div className="rounded-xl border border-red-200 bg-white p-5 text-center">
            <p className="mb-3 text-sm text-red-600">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && posts.length === 0 && (
          <div className="rounded-xl border border-orange-100 bg-white/80 p-8 text-center text-gray-500 shadow-sm">
            No discussions yet. Start the first conversation!
          </div>
        )}

        {posts.map((post) => {
          const isOwner =
            user && getId(post.user) === userId;

          return (
            <div
              key={post._id}
              className="rounded-xl border border-orange-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="mb-1 flex items-start justify-between text-sm text-gray-500">
                <div>
                  <span className="font-medium text-orange-700">
                    {post.user?.name || "Anonymous"}
                  </span>
                  <span className="ml-2">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                {isOwner && (
                  <button
                    onClick={() => askDeletePost(post)}
                    className="ml-3 rounded-full bg-red-50 p-1 text-red-500 hover:bg-red-100"
                    title="Delete discussion"
                    aria-label="Delete discussion"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <p className="mb-3 whitespace-pre-wrap break-words text-gray-700">
                {post.content}
              </p>

              <div className="flex gap-6 text-sm">
                <button
                  onClick={() => handleLike(post._id)}
                  disabled={likingId === getId(post._id)}
                  className={`flex items-center gap-1 transition disabled:opacity-50 ${
                    post.liked
                      ? "text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                  aria-label={post.liked ? "Unlike discussion" : "Like discussion"}
                >
                  <Heart
                    size={16}
                    className={post.liked ? "fill-red-500 text-red-500" : ""}
                  />
                  {post.likes || 0}
                </button>

                <button
                  onClick={() => openCommentsModal(post)}
                  className="flex items-center gap-1 text-gray-600 transition hover:text-red-500"
                >
                  <MessageSquare size={16} />
                  Comment
                  {post.comments?.length ? ` (${post.comments.length})` : ""}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <motion.button
        onClick={() => (user ? setShowNewPostModal(true) : navigate("/login"))}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
      >
        <Plus size={20} />
        Start Discussion
      </motion.button>

      {/* New discussion modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget && !creating) {
                setShowNewPostModal(false);
              }
            }}
          >
            <motion.div
              className="w-11/12 max-w-md rounded-xl bg-white p-6 shadow-lg"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-orange-700">
                  Start a new Discussion
                </h3>
                <button
                  onClick={() => !creating && setShowNewPostModal(false)}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <textarea
                value={newPost}
                onChange={(event) => setNewPost(event.target.value)}
                maxLength={5000}
                rows={4}
                className="mb-3 w-full rounded-lg border border-orange-200 p-2 outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="What do you want to talk about?"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewPostModal(false)}
                  disabled={creating}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newPost.trim() || creating}
                  className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 font-medium text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (
                event.target === event.currentTarget &&
                !addingComment &&
                !deletingCommentId
              ) {
                closeCommentsModal();
              }
            }}
          >
            <motion.div
              className="w-11/12 max-w-xl rounded-2xl bg-white p-6 shadow-xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-red-600">
                  Comments on {selectedPost.content?.slice(0, 25) || "post"}
                </h3>
                <button
                  onClick={closeCommentsModal}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="Close comments"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mb-4 max-h-72 space-y-3 overflow-y-auto">
                {selectedPost.comments?.length ? (
                  selectedPost.comments.map((comment) => {
                    const isPostOwner =
                      user && getId(selectedPost.user) === userId;
                    const isCommentOwner =
                      user && getId(comment.user) === userId;
                    const canDeleteComment = isPostOwner || isCommentOwner;

                    return (
                      <div
                        key={comment._id}
                        className="flex items-start justify-between rounded-2xl bg-purple-50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-red-700">
                            {comment.user?.name || "Anonymous"}
                          </p>
                          <p className="break-words text-sm text-gray-700">
                            {comment.content}
                          </p>
                        </div>

                        {canDeleteComment && (
                          <button
                            onClick={() =>
                              handleDeleteComment(
                                selectedPost._id,
                                comment._id
                              )
                            }
                            disabled={
                              deletingCommentId === getId(comment._id)
                            }
                            className="ml-3 rounded-full bg-red-100 p-1 hover:bg-red-200 disabled:opacity-50"
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">
                    No comments yet. Be the first one!
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleAddComment();
                    }
                  }}
                  maxLength={1000}
                  placeholder="Write a comment..."
                  className="min-w-0 flex-1 rounded-2xl border border-red-200 px-4 py-2 outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addingComment}
                  className="rounded-2xl bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingComment ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deletePost && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-11/12 max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <h3 className="mb-3 text-lg font-semibold text-red-600">
                Delete discussion?
              </h3>
              <p className="mb-5 text-sm text-gray-600">
                Are you sure you want to delete this discussion?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deletingPost}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePost}
                  disabled={deletingPost}
                  className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingPost ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
