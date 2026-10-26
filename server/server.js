import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import "./config/cloudinary.js";
import PostRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ChatRoutes from "./routes/chatRoutes.js";
import Community from "./models/Community.js";
import adminCommunityRoutes from "./routes/adminCommunityRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Make Socket.io available to controllers
app.set("io", io);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/posts", PostRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/admin/communities", adminCommunityRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hometown Hub API is running",
  });
});

// Socket.io connection and notification rooms
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join user notification room
  socket.on("joinUserRoom", (userId) => {
    if (
      typeof userId === "string" &&
      /^[a-fA-F0-9]{24}$/.test(userId)
    ) {
      socket.data.userId = userId;
      socket.join(userId);

      console.log(`User joined notification room: ${userId}`);
    }
  });

  // Join community chat room
  socket.on("joinCommunityRoom", async (communityId) => {
    try {
      const userId = socket.data.userId;

      if (
        !userId ||
        typeof communityId !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(communityId)
      ) {
        return;
      }

      const community = await Community.findById(communityId).select("members");

      const isMember = community?.members.some(
        (memberId) => memberId.toString() === userId
      );

      if (isMember) {
        socket.join(`community:${communityId}`);

        console.log(`User joined community chat: ${communityId}`);
      }
    } catch (error) {
      console.error("Join community room error:", error.message);
    }
  });

  // Leave community chat room
  socket.on("leaveCommunityRoom", (communityId) => {
    if (
      typeof communityId === "string" &&
      /^[a-fA-F0-9]{24}$/.test(communityId)
    ) {
      socket.leave(`community:${communityId}`);
      console.log(`User left community chat: ${communityId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});