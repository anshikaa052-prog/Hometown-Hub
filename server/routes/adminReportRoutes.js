import express from "express";
import {
  getAllReports,
  updateReportStatus,
} from "../controllers/adminReportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllReports);

router.put("/:reportId/status", protect, adminOnly, updateReportStatus);

export default router;
