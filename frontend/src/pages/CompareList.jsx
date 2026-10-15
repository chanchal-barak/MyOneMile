
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ThumbsUp, Search, ArrowDownAZ } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function CompareList() {
  const [compares, setCompares] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchCompares = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/api/compare");

        if (!isMounted) return;

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.compares;

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setCompares(data);
      } catch (err) {
        if (!isMounted) return;

        console.error("Fetch Compare Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load comparisons. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCompares();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search and sorting
  const filteredCompares = useMemo(() => {
    let filtered = compares.filter((c) =>
      `${c.area1 || ""} ${c.area2 || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );

    if (sortBy === "likes") {
      return filtered.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    }

    // Use actual creation dates when available.
    if (
      filtered.length > 0 &&
      filtered.every((item) => item.createdAt)
    ) {
      return filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    // Fallback to the original newest-first behavior.
    return filtered.reverse();
  }, [compares, search, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-8 relative"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-green-700 tracking-tight"
        >
          Compare Areas
        </motion.h2>

        {/* Create Button - Desktop */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/compare/new")}
          className="hidden md:flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-700 transition-all"
        >
          <Plus size={18} /> New
        </motion.button>
      </div>

      {/* Search and Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 backdrop-blur-md p-4 rounded-xl shadow flex flex-col md:flex-row items-center justify-between gap-4 mb-10 border border-green-200"
      >
        {/* Search */}
        <div className="flex items-center w-full md:w-1/2 bg-white rounded-lg px-3 py-2 border border-green-200 shadow-sm focus-within:ring-2 focus-within:ring-green-400 transition-all">
          <Search className="text-green-500 mr-2" size={18} />

          <input
            type="text"
            placeholder="Search by area name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowDownAZ size={18} className="text-green-600" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-green-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </motion.div>

      {/* Comparison Cards */}
      {loading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-700 text-center text-lg mt-20"
        >
          Loading comparisons...
        </motion.p>
      ) : error ? (
        <div className="text-center mt-20">
          <p className="text-red-600 text-lg mb-4">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredCompares.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center text-lg mt-20"
        >
          No results found. Try a different search or click{" "}
          <span className="font-semibold text-green-600">New</span> to create one!
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCompares.map((c, index) => (
            <motion.div
              key={c._id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="p-5 bg-white border border-green-200 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition-all backdrop-blur-sm"
              onClick={() => navigate(`/compare/${c._id}`)}
            >
              <div className="flex justify-between items-center gap-3">
                <h3 className="text-xl font-semibold text-green-800">
                  {c.area1}{" "}
                  <span className="text-green-500">vs</span>{" "}
                  {c.area2}
                </h3>

                <div className="flex items-center text-green-600 font-medium shrink-0">
                  <ThumbsUp size={16} className="mr-1" />
                  {c.likes?.length || 0}
                </div>
              </div>

              <p className="text-gray-600 mt-2 text-sm">
                {c.categories?.length || 0} categories
              </p>

              {/* Underline Animation */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4 }}
                className="h-1 mt-3 rounded-full bg-green-400"
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Floating Create Button - Mobile */}
      <motion.button
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.15, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/compare/new")}
        aria-label="Create a new comparison"
        className="md:hidden fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all animate-pulse"
      >
        <Plus size={22} />
      </motion.button>
    </motion.div>
  );
}
