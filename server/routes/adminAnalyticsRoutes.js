
import express from "express";
import { getAdminAnalytics } from "../controllers/adminAnalyticsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAdminAnalytics);

export default router;
