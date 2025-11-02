import express from "express";
import {
  createCompare,
  getAllCompares,
  getCompareById,
  voteCategory,
  toggleLike,
} from "../controllers/compareController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, createCompare);
router.get("/", getAllCompares);
router.get("/:id", getCompareById);
router.post("/:id/vote", authMiddleware, voteCategory);
router.post("/:id/like", authMiddleware, toggleLike);

export default router;
