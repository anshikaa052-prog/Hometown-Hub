import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, getProfile);

router.put("/", protect, updateProfile);

router.post(
  "/picture",
  protect,
  upload.single("profilePic"),
  uploadProfilePicture
);

export default router;