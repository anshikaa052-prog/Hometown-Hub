import express from "express";

import {
  createCommunity,
  getCommunities,
  searchCommunities,
  joinCommunity,
  getCommunityById,
  uploadCommunityCover,
  assignModerator,
  removeModerator,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../controllers/communityController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Community routes
router.post("/", protect, createCommunity);
router.get("/", protect, getCommunities);
router.get("/search", protect, searchCommunities);

// Join community
router.post("/:communityId/join", protect, joinCommunity);

// View pending join requests
router.get(
  "/:communityId/join-requests",
  protect,
  getJoinRequests
);

// Approve a join request
router.put(
  "/:communityId/join-requests/:userId/approve",
  protect,
  approveJoinRequest
);

// Reject a join request
router.delete(
  "/:communityId/join-requests/:userId",
  protect,
  rejectJoinRequest
);

// Upload community cover
router.post(
  "/:communityId/cover",
  protect,
  upload.single("coverImage"),
  uploadCommunityCover
);

// Assign a moderator
router.post(
  "/:communityId/moderators",
  protect,
  assignModerator
);

// Remove a moderator
router.delete(
  "/:communityId/moderators/:userId",
  protect,
  removeModerator
);

// Get community by ID
router.get("/:communityId", protect, getCommunityById);

export default router;