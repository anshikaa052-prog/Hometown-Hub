import express from "express";

import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/post/:postId",
  protect,
  createComment
);

router.get(
  "/post/:postId",
  protect,
  getPostComments
);

router.put(
  "/:commentId",
  protect,
  updateComment
);

router.delete(
  "/:commentId",
  protect,
  deleteComment
);

export default router;