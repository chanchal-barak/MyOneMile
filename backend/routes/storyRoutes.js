import express from "express";
import upload from "../middleware/upload.js";
import { createStory, getStories } from "../controllers/storyController.js";

const router = express.Router();

router.get("/", getStories);
router.post("/", upload.single("image"), createStory);

export default router;
