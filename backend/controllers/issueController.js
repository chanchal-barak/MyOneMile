import Issue from "../models/Issues.js";

export const createIssue = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : ""; 

    const issue = new Issue({
      ...req.body,
      user: req.user._id,
      image: imageUrl,
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error("Create Issue Error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate("user", "name");
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const userId = req.user._id.toString();

    issue.dislikes = issue.dislikes.filter((id) => id.toString() !== userId);

    if (issue.likes.some((id) => id.toString() === userId)) {
      issue.likes = issue.likes.filter((id) => id.toString() !== userId);
    } else {
      issue.likes.push(userId);
    }

    await issue.save();

    if (req.io) {
      req.io.emit("issueLiked", {
        issueId: issue._id,
        likes: issue.likes,
        dislikes: issue.dislikes,
      });
    }

    res.json({ likes: issue.likes, dislikes: issue.dislikes });
  } catch (error) {
    console.error("Like Issue Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const dislikeIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const userId = req.user._id.toString();

    issue.likes = issue.likes.filter((id) => id.toString() !== userId);

    if (issue.dislikes.some((id) => id.toString() === userId)) {
      issue.dislikes = issue.dislikes.filter((id) => id.toString() !== userId);
    } else {
      issue.dislikes.push(userId);
    }

    await issue.save();

    if (req.io) {
      req.io.emit("issueDisliked", {
        issueId: issue._id,
        likes: issue.likes,
        dislikes: issue.dislikes,
      });
    }

    res.json({ likes: issue.likes, dislikes: issue.dislikes });
  } catch (error) {
    console.error("Dislike Issue Error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date(),
    });

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getComments = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    res.json(issue.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};