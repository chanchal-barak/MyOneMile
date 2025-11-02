import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
