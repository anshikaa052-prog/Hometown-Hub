
import express from "express";

import {
  getPendingCommunities,
  approveCommunity,
  rejectCommunity,
} from "../controllers/adminCommunityController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get communities awaiting approval
router.get(
  "/pending",
  protect,
  adminOnly,
  getPendingCommunities
);

// Approve a community
router.put(
  "/:communityId/approve",
  protect,
  adminOnly,
  approveCommunity
);

// Reject a community
router.put(
  "/:communityId/reject",
  protect,
  adminOnly,
  rejectCommunity
);

export default router;
