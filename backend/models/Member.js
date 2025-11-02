import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 0 },
  avatar: { type: String },
}, { timestamps: true });

export default mongoose.model("Member", memberSchema);
