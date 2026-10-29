import express from "express";
import {
  getAllUsers,
  blockUser,
  unblockUser,
  updateUserRole,
} from "../controllers/adminUserController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users
router.get("/", protect, adminOnly, getAllUsers);

// Update user role
router.put("/:userId/role", protect, adminOnly, updateUserRole);

// Block a user
router.put("/:userId/block", protect, adminOnly, blockUser);

// Unblock a user
router.put("/:userId/unblock", protect, adminOnly, unblockUser);

export default router;