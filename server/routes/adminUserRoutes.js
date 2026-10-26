
import express from "express";
import {
  getAllUsers,
  blockUser,
  unblockUser,
} from "../controllers/adminUserController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users
router.get("/", protect, adminOnly, getAllUsers);

// Block a user
router.put("/:userId/block", protect, adminOnly, blockUser);

// Unblock a user
router.put("/:userId/unblock", protect, adminOnly, unblockUser);

export default router;
