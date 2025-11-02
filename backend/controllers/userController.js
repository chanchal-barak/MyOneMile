import Issue from "../models/Issues.js";
import User from "../models/User.js";

export const getMyPosts = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyLikedPosts = async (req, res) => {
  try {
    const issues = await Issue.find({ likes: req.user._id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Issue.countDocuments({ user: userId });
    const likes = await Issue.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } },
    ]);

    const user = await User.findById(userId).select("joinedCommunities");

    res.json({
      posts,
      likes: likes[0]?.totalLikes || 0,
      communities: user?.joinedCommunities?.length || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    if (updates.gender) {
      updates.gender = updates.gender.toLowerCase();
      if (updates.gender === "female") {
        updates.avatar = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
      } else if (updates.gender === "male") {
        updates.avatar = "https://cdn-icons-png.flaticon.com/512/4140/4140037.png";
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
};
