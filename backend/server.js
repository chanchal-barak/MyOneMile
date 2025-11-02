import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import compareRoutes from "./routes/compareRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("🌐 Meri Awaj API is running successfully!");
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
