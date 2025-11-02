import Discussion from "../models/Discussion.js";

export const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find().sort({ createdAt: -1 });
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const discussion = await Discussion.create({ title, content, author });
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
