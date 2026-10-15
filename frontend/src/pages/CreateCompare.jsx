
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api/axios";

const predefinedCategories = [
  "Cleanliness",
  "Traffic",
  "Safety",
  "Infrastructure",
  "Public Transport",
  "Air Quality",
  "Water Supply",
  "Waste Management",
  "Street Lighting",
  "Healthcare",
  "Education",
  "Noise Level",
];

export default function CreateCompare() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [area1, setArea1] = useState("");
  const [area2, setArea2] = useState("");
  const [categories, setCategories] = useState([]);
  const [catInput, setCatInput] = useState("");
  const [catFocus, setCatFocus] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCatSuggestions = useMemo(() => {
    const input = catInput.trim().toLowerCase();

    return predefinedCategories.filter(
      (category) =>
        category.toLowerCase().includes(input) &&
        !categories.some(
          (selected) =>
            selected.toLowerCase() === category.toLowerCase()
        )
    );
  }, [catInput, categories]);

  const addCategory = (value) => {
    const category = (value ?? catInput).trim();

    if (!category) return;

    const alreadyExists = categories.some(
      (selected) =>
        selected.toLowerCase() === category.toLowerCase()
    );

    if (alreadyExists) {
      setCatInput("");
      return;
    }

    setCategories((prev) => [...prev, category]);
    setCatInput("");
  };

  const removeCategory = (index) => {
    setCategories((prev) =>
      prev.filter((_, idx) => idx !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !area1.trim() ||
      !area2.trim() ||
      categories.length === 0
    ) {
      toast.error("Please fill all fields and add at least one category.");
      return;
    }

    if (area1.trim().toLowerCase() === area2.trim().toLowerCase()) {
      toast.error("Please select two different areas.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to create a comparison.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/compare/add", {
        title: title.trim(),
        area1: area1.trim(),
        area2: area2.trim(),
        categories,
      });

      toast.success("Comparison created successfully!");
      navigate("/compare");
    } catch (err) {
      console.error("Create Compare Error:", err);

      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        (status === 401
          ? "Your session has expired. Please log in again."
          : "Could not create comparison. Please try again.");

      toast.error(message);

      if (status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setArea1("");
    setArea2("");
    setCategories([]);
    setCatInput("");
    setCatFocus(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6 flex flex-col items-center"
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-green-700 px-4 py-2 rounded-full shadow-sm flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </motion.button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-green-800 tracking-tight">
            Create Comparison
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-green-200 shadow-lg p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TITLE */}
            <div>
              <label
                htmlFor="title"
                className="text-green-800 font-semibold mb-1 block"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Eg: sec 24 vs sec 29"
                required
                maxLength={150}
                className="w-full rounded-xl border border-green-100 p-3 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            {/* AREAS */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="area1"
                  className="text-green-800 font-semibold mb-1 block"
                >
                  Area 1
                </label>

                <input
                  id="area1"
                  name="area1"
                  value={area1}
                  onChange={(e) => setArea1(e.target.value)}
                  placeholder="Type Area 1"
                  required
                  className="w-full rounded-xl border border-green-100 p-3 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              <div>
                <label
                  htmlFor="area2"
                  className="text-green-800 font-semibold mb-1 block"
                >
                  Area 2
                </label>

                <input
                  id="area2"
                  name="area2"
                  value={area2}
                  onChange={(e) => setArea2(e.target.value)}
                  placeholder="Type Area 2"
                  required
                  className="w-full rounded-xl border border-green-100 p-3 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
            </div>

            {/* CATEGORY SECTION */}
            <div>
              <label className="text-green-800 font-semibold block mb-2">
                Categories
              </label>

              {/* CATEGORY PILLS */}
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    No categories added yet
                  </p>
                )}

                {categories.map((category, index) => (
                  <motion.div
                    key={`${category}-${index}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-1 bg-white border border-green-200 rounded-full shadow-sm flex items-center gap-2"
                  >
                    <span className="text-green-800 text-sm">
                      {category}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      aria-label={`Remove ${category}`}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* CATEGORY INPUT AND SUGGESTIONS */}
              <div className="relative">
                <input
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  onFocus={() => setCatFocus(true)}
                  onBlur={() =>
                    setTimeout(() => setCatFocus(false), 150)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCategory();
                    }

                    if (e.key === "Escape") {
                      setCatFocus(false);
                    }
                  }}
                  placeholder="Type category and press Enter..."
                  aria-label="Add comparison category"
                  className="w-full rounded-xl border border-green-100 p-3 focus:outline-none focus:ring-2 focus:ring-green-300"
                />

                {catFocus && filteredCatSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute w-full bg-white border border-green-100 rounded-xl shadow-md mt-2 max-h-48 overflow-auto z-20"
                  >
                    {filteredCatSuggestions.map((category) => (
                      <div
                        key={category}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addCategory(category);
                        }}
                        className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-green-900"
                      >
                        {category}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Choose a suggestion or type a custom category and press Enter.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-5 py-2 border border-green-200 rounded-xl bg-white hover:bg-gray-50 text-green-700 disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  !title.trim() ||
                  !area1.trim() ||
                  !area2.trim() ||
                  categories.length === 0
                }
                className={`px-6 py-2 text-white rounded-xl font-semibold shadow ${
                  loading ||
                  !title.trim() ||
                  !area1.trim() ||
                  !area2.trim() ||
                  categories.length === 0
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Creating..." : "Create Comparison"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
