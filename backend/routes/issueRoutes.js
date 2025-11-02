// routes/issueRoutes.js
import express from "express";
import multer from "multer"; 
import upload from "../middleware/upload.js"; 
import protect from "../middleware/authMiddleware.js"; 
import {
  createIssue,
  getIssues,
  likeIssue,
  dislikeIssue,
  addComment,
  getComments,
} from "../controllers/issueController.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createIssue);
router.get("/", getIssues);

router.put("/:id/like", protect, likeIssue);
router.put("/:id/dislike", protect, dislikeIssue);

router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", getComments);

export default router;
