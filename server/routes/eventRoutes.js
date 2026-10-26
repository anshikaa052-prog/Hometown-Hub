import express from "express";

import {
  createEvent,
  getCommunityEvents,
  joinEvent,
  getEventById,
  uploadEventCover,
} from "../controllers/eventController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create an event
router.post("/", protect, createEvent);

// Get all events for a community
router.get(
  "/community/:communityId",
  protect,
  getCommunityEvents
);

// Join an event
router.post(
  "/:eventId/join",
  protect,
  joinEvent
);

// Upload event cover image
router.post(
  "/:eventId/cover",
  protect,
  upload.single("coverImage"),
  uploadEventCover
);

// Get one event with attendee details
router.get(
  "/:eventId",
  protect,
  getEventById
);

export default router;