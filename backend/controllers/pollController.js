import Poll from "../models/Poll.js";

export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate("createdBy", "name email");
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = await Poll.create({
      question,
      options: options.map((o) => ({ text: o, votes: 0 })),
      createdBy: req.user, // ✅ Attach logged-in user
    });
    const populated = await poll.populate("createdBy", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const poll = await Poll.findById(id).populate("createdBy", "name email");
    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

