import express from "express";
import {
  getChatMessages,
  sendChatMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:communityId", protect, getChatMessages);
router.post("/:communityId", protect, sendChatMessage);

export default router;