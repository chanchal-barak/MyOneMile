import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("🔍 Auth header received:", authHeader);

  const token = authHeader ? authHeader.replace("Bearer ", "") : null;
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    req.user = { _id: decoded.id };
    req.userObj = await User.findById(decoded.id).select("-password");

    if (!req.userObj) {
      console.log("❌ User not found for token ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Authenticated user:", req.userObj.name || req.userObj.email);
    next();
  } catch (error) {
    console.error("❌ Invalid or expired token:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
