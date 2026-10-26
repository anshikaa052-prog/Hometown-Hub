import express from "express";

import {
  createPost,
  getCommunityPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  reportPost,
} from "../controllers/postController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create a post
router.post(
  "/",
  protect,
  upload.single("image"),
  createPost
);

// Get community posts
router.get(
  "/community/:communityId",
  protect,
  getCommunityPosts
);

// Get a single post
router.get(
  "/:postId",
  protect,
  getPostById
);

// Update a post
router.put(
  "/:postId",
  protect,
  updatePost
);

// Delete a post
router.delete(
  "/:postId",
  protect,
  deletePost
);

// Like or unlike a post
router.post(
  "/:postId/like",
  protect,
  toggleLike
);

// Report a post
router.post(
  "/:postId/report",
  protect,
  reportPost
);

export default router;
