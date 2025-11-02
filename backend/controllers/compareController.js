import Compare from "../models/Compare.js";

// ✅ Create new comparison
export const createCompare = async (req, res) => {
  try {
    const { title, area1, area2, categories } = req.body;

    if (!title || !area1 || !area2)
      return res.status(400).json({ message: "All fields are required" });

    const compare = await Compare.create({
      title,
      area1,
      area2,
      categories: categories.map((c) => ({ name: c })),
      createdBy: req.user?._id || null,
    });

    res.status(201).json(compare);
  } catch (err) {
    console.error("❌ Create Compare Error:", err.message);
    res.status(500).json({ message: "Failed to create comparison" });
  }
};

// ✅ Get all comparisons
export const getAllCompares = async (req, res) => {
  try {
    const compares = await Compare.find().sort({ createdAt: -1 });
    res.json(compares);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comparisons" });
  }
};

// ✅ Get single comparison
export const getCompareById = async (req, res) => {
  try {
    const compare = await Compare.findById(req.params.id);
    if (!compare) return res.status(404).json({ message: "Not found" });
    res.json(compare);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comparison" });
  }
};

// ✅ Vote for a category (with switch handling)
export const voteCategory = async (req, res) => {
  try {
    const { categoryIndex, area } = req.body;
    const { id } = req.params;
    const userId = req.user?._id;

    const compare = await Compare.findById(id);
    if (!compare) return res.status(404).json({ message: "Comparison not found" });

    const category = compare.categories[categoryIndex];
    if (!category.votes) category.votes = [];

    const existingVote = category.votes.find(
      (v) => v.user.toString() === userId.toString()
    );

    if (existingVote) {
      // 🔁 If already voted, handle switch or unvote
      if (existingVote.area === area) {
        // Remove existing vote (toggle off)
        category.votes = category.votes.filter(
          (v) => v.user.toString() !== userId.toString()
        );
        if (area === "area1" && category.area1Votes > 0) category.area1Votes--;
        if (area === "area2" && category.area2Votes > 0) category.area2Votes--;
      } else {
        // Switch sides
        if (existingVote.area === "area1") {
          if (category.area1Votes > 0) category.area1Votes--;
          category.area2Votes++;
          existingVote.area = "area2";
        } else {
          if (category.area2Votes > 0) category.area2Votes--;
          category.area1Votes++;
          existingVote.area = "area1";
        }
      }
    } else {
      // ➕ New vote
      category.votes.push({ user: userId, area });
      if (area === "area1") category.area1Votes++;
      if (area === "area2") category.area2Votes++;
    }

    await compare.save();
    res.json(compare);
  } catch (err) {
    console.error("❌ Vote Error:", err.message);
    res.status(500).json({ message: "Vote failed" });
  }
};

// ✅ Like or Unlike the whole comparison
export const toggleLike = async (req, res) => {
  try {
    const compare = await Compare.findById(req.params.id);
    const userId = req.user?._id;

    const index = compare.likes.indexOf(userId);
    if (index === -1) compare.likes.push(userId);
    else compare.likes.splice(index, 1);

    await compare.save();
    res.json(compare);
  } catch (err) {
    res.status(500).json({ message: "Like toggle failed" });
  }
};


