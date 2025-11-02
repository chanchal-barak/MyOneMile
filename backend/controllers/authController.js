import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getAvatarByGender = (gender = "male") => {
  gender = gender.toLowerCase();
  if (gender === "female") return "https://avatar.iran.liara.run/public/girl?random=1";
  if (gender === "male") return "https://avatar.iran.liara.run/public/boy?random=1";
  return "https://avatar.iran.liara.run/public"; 
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, birth, gender, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    const avatarUrl = avatar || getAvatarByGender(gender);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      birth,
      gender,
      avatar: avatarUrl,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birth: user.birth,
        gender: user.gender,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Error in registerUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birth: user.birth,
        gender: user.gender,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    if (req.file) updates.avatar = `uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeIssue = async (req, res) => {
  try {
    const userId = req.user; 
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const alreadyLiked = issue.likes.includes(userId);
    if (alreadyLiked) {
      issue.likes = issue.likes.filter((id) => id.toString() !== userId);
    } else {
      issue.likes.push(userId);
    }

    await issue.save();
    res.json({ likes: issue.likes.length, liked: !alreadyLiked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating like" });
  }
};

export const addComment = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const newComment = {
      user: req.user,
      text: req.body.text,
      createdAt: new Date(),
    };

    issue.comments.push(newComment);
    await issue.save();

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

export const getComments = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("comments.user", "name email");
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    res.json(issue.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};
