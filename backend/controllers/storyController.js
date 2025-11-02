import Story from "../models/Story.js";

export const getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStory = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const image = req.file?.path || null;
    const story = await Story.create({ title, content, author, image });
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
