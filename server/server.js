
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

const app = express();
const httpServer = createServer(app);

// Check and allow trusted frontend origins
const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    // Stable production frontend URL
    if (hostname === "hometown-hub-one.vercel.app") {
      return url.protocol === "https:";
    }

    // Hometown Hub Vercel deployment URLs
    const isHometownVercel =
      /^hometown-[a-z0-9-]+-anshikaa052-progs-projects\.vercel\.app$/.test(
        hostname
      );

    if (isHometownVercel) {
      return url.protocol === "https:";
    }

    // Local development
    return (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(hostname)
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origin not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Database
connectDB();

// Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
});

app.set("io", io);

// Middleware
app.use(cors(corsOptions));
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

// Socket.io connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

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
