import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateCompare() {
  const navigate = useNavigate();

  const areaSuggestions = [
    "Delhi", "New Delhi", "Central Delhi", "North Delhi", "South Delhi",
    "East Delhi", "West Delhi", "Connaught Place", "Chandni Chowk",
    "Karol Bagh", "Rajouri Garden", "Dwarka", "Rohini", "Pitampura",
    "Vasant Kunj", "Lajpat Nagar", "Hauz Khas", "Saket", "Janakpuri",
    "Malviya Nagar", "Kalkaji", "Greater Kailash", "Okhla", "Nehru Place",
    "Preet Vihar", "Mayur Vihar", "Yamuna Vihar", "Paschim Vihar",
    "Model Town", "Civil Lines", "Shahdara", "Patel Nagar", "Punjabi Bagh",
    "Tilak Nagar", "Naraina", "Azadpur", "Adarsh Nagar", "Green Park",
    "Chirag Delhi", "Mehrauli", "Munirka", "Najafgarh", "Palam", "Sarita Vihar",
    "Jamia Nagar", "Khan Market", "Golf Links", "Defence Colony",
    "Safdarjung", "Kailash Colony", "Gurgaon", "Noida", "Ghaziabad", "Faridabad"
  ];

  const predefinedCategories = [
    "Cleanliness", "Traffic", "Safety", "Infrastructure", "Public Transport",
    "Air Quality", "Water Supply", "Waste Management", "Street Lighting",
    "Healthcare", "Education", "Noise Level"
  ];

  const [form, setForm] = useState({ title: "", area1: "", area2: "" });
  const [categoryInputs, setCategoryInputs] = useState([""]);
  const [activeField, setActiveField] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCategoryBox = () => setCategoryInputs((prev) => [...prev, ""]);
  const removeCategoryBox = (i) => setCategoryInputs((p) => p.filter((_, x) => x !== i));
  const handleCategoryChange = (i, v) => setCategoryInputs((p) => p.map((c, x) => (x === i ? v : c)));
  const handleCategorySelect = (i, s) => {
    const updated = [...categoryInputs];
    updated[i] = s;
    setCategoryInputs(updated);
    setActiveField(null);
  };

  const handleSubmit = async () => {
    const categories = categoryInputs.filter((c) => c.trim() !== "");
    if (!form.title || !form.area1 || !form.area2 || categories.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, categories }),
      });
      if (res.ok) {
        alert("✅ Comparison created successfully!");
        navigate("/compare");
      } else alert("❌ Failed to create comparison.");
    } catch (err) {
      console.error(err);
    }
  };

  // ✨ Dropdown animation variant
  const dropdownAnim = {
    initial: { opacity: 0, scale: 0.95, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-green-100 flex justify-center items-start pt-20 px-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-green-200"
      >
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeft
            className="cursor-pointer text-green-600 hover:scale-110 transition-transform"
            onClick={() => navigate(-1)}
            size={22}
          />
          <h2 className="text-green-700 font-bold text-xl flex items-center gap-2">
            <Plus size={18} /> Create Comparison
          </h2>
        </div>

        <motion.input
          type="text"
          placeholder="Enter comparison title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 mb-4 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
        />

        {[1, 2].map((num) => (
          <div key={num} className="relative mb-4">
            <motion.input
              type="text"
              placeholder={`Enter area ${num}`}
              value={form[`area${num}`]}
              onChange={(e) => setForm({ ...form, [`area${num}`]: e.target.value })}
              onFocus={() => setActiveField(`area${num}`)}
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />
            <AnimatePresence>
              {activeField === `area${num}` && form[`area${num}`].trim() && (
                <motion.div
                  {...dropdownAnim}
                  className="absolute bg-white border border-green-200 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto z-20 w-full origin-top"
                >
                  {areaSuggestions
                    .filter((a) => a.toLowerCase().includes(form[`area${num}`].toLowerCase()))
                    .slice(0, 6)
                    .map((area) => (
                      <div
                        key={area}
                        onClick={() => {
                          setForm({ ...form, [`area${num}`]: area });
                          setActiveField(null);
                        }}
                        className="p-2 cursor-pointer hover:bg-green-100 text-green-800 font-medium"
                      >
                        {area}
                      </div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <label className="block text-green-700 font-semibold mb-2">Categories</label>

        <AnimatePresence>
          {categoryInputs.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative mb-3"
            >
              <input
                type="text"
                value={cat}
                placeholder="Type or select category..."
                onChange={(e) => handleCategoryChange(i, e.target.value)}
                onFocus={() => setActiveField(`category-${i}`)}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
              <button
                type="button"
                onClick={() => removeCategoryBox(i)}
                className="absolute right-3 top-3 text-red-400 hover:text-red-600"
              >
                <X size={18} />
              </button>

              <AnimatePresence>
                {activeField === `category-${i}` && cat.trim() && (
                  <motion.div
                    {...dropdownAnim}
                    className="absolute bg-white border border-green-200 rounded-xl mt-1 shadow-lg max-h-40 overflow-y-auto z-30 w-full origin-top"
                  >
                    {predefinedCategories
                      .filter((c) => c.toLowerCase().includes(cat.toLowerCase()))
                      .slice(0, 5)
                      .map((c) => (
                        <div
                          key={c}
                          onClick={() => handleCategorySelect(i, c)}
                          className="p-2 hover:bg-green-100 cursor-pointer text-green-700 font-medium"
                        >
                          {c}
                        </div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={addCategoryBox}
          className="text-green-600 font-semibold underline mb-6 hover:text-green-700 transition-colors"
        >
          + Add more category
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles size={18} /> Create Comparison
        </motion.button>
      </motion.div>
    </div>
  );
}
