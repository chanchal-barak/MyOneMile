import express from "express";
import { getPolls, createPoll, votePoll } from "../controllers/pollController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPolls);
router.post("/", authMiddleware, createPoll);
router.post("/:id/vote", votePoll);

export default router;
