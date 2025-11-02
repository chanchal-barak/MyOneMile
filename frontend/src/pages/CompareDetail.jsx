import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaArrowLeft, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

export default function CompareDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compare, setCompare] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    axios
      .get(`http://localhost:4000/api/compare/${id}`)
      .then((res) => setCompare(res.data))
      .catch((err) => console.error("❌ Fetch Compare Error:", err));
  }, [id]);

  const handleVote = async (categoryIndex, area) => {
    if (!user) {
      alert("Please login to vote!");
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:4000/api/compare/${id}/vote`,
        { categoryIndex, area },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompare(res.data);
    } catch (err) {
      console.error("❌ Vote Error:", err.message);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like!");
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:4000/api/compare/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompare(res.data);
    } catch (err) {
      console.error("❌ Like Error:", err.message);
    }
  };

  if (!compare)
    return (
      <div className="text-center mt-20 text-green-700 font-semibold">
        Loading Comparison...
      </div>
    );

  const userId = user?._id;
  const liked = compare.likes?.includes(userId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6 flex flex-col items-center relative"
    >
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center text-green-700 font-semibold mb-4 bg-white px-4 py-2 rounded-full shadow hover:shadow-md transition-all"
      >
        <FaArrowLeft className="mr-2" /> Back
      </motion.button>

      {/* Title */}
      <motion.h2
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-green-800 mb-4 text-center"
      >
        {compare.area1} <span className="text-green-600">vs</span> {compare.area2}
      </motion.h2>

      {/* Like Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLike}
        className="flex items-center gap-2 bg-white border border-green-300 px-5 py-2 rounded-full shadow-md text-green-700 font-semibold mb-6 hover:bg-green-100 transition-all"
      >
        {liked ? (
          <FaHeart className="text-green-600 text-xl" />
        ) : (
          <FaRegHeart className="text-green-600 text-xl" />
        )}
        {compare.likes?.length || 0} Likes
      </motion.button>

      {/* Categories List */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl bg-white border border-green-200 rounded-2xl shadow-xl p-6"
      >
        {compare.categories.map((cat, i) => {
          const userVote = cat.votes.find(
            (v) => v.user === userId || v.user?._id === userId
          );

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center border-b border-green-100 py-3"
            >
              {/* Area 1 */}
              <div className="flex flex-col items-center w-1/3">
                <button
                  onClick={() => handleVote(i, "area1")}
                  className="flex items-center gap-1"
                >
                  {userVote?.area === "area1" ? (
                    <FaHeart className="text-green-600 text-xl" />
                  ) : (
                    <FaRegHeart className="text-green-600 text-xl" />
                  )}
                  <span className="text-green-700 font-medium">
                    {cat.area1Votes}
                  </span>
                </button>
              </div>

              {/* Category name */}
              <p className="font-semibold text-green-800 w-1/3 text-center text-lg">
                {cat.name}
              </p>

              {/* Area 2 */}
              <div className="flex flex-col items-center w-1/3">
                <button
                  onClick={() => handleVote(i, "area2")}
                  className="flex items-center gap-1"
                >
                  {userVote?.area === "area2" ? (
                    <FaHeart className="text-green-600 text-xl" />
                  ) : (
                    <FaRegHeart className="text-green-600 text-xl" />
                  )}
                  <span className="text-green-700 font-medium">
                    {cat.area2Votes}
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating Create Button */}
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/compare/new")}
        className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all"
      >
        <FaPlus size={20} />
      </motion.button>
    </motion.div>
  );
}
