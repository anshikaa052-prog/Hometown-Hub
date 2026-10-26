
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully",
    user: {
      userId: req.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isBlocked: req.user.isBlocked,
    },
  });
});

export default router;
