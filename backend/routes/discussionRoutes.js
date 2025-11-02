import express from "express";
import { createDiscussion, getDiscussions } from "../controllers/discussionController.js";

const router = express.Router();

router.get("/", getDiscussions);
router.post("/", createDiscussion);

export default router;
