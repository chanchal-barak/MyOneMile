import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    username: { type: String, required: true, unique: true, trim: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: { type: String },
    birth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    avatar: { type: String, default: "" },
    darkMode: { type: Boolean, default: false },

    likedIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
