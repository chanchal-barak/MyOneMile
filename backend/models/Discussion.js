import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
  },
  { timestamps: true }
);

export default mongoose.model("Discussion", discussionSchema);
