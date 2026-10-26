import Event from "../models/Event.js";
import Community from "../models/Community.js";
import cloudinary from "../config/cloudinary.js";

// Create a new event
export const createEvent = async (req, res, next) => {
  try {
    const {
      communityId,
      title,
      description,
      date,
      time,
      location,
    } = req.body;

    if (
      !communityId ||
      !title?.trim() ||
      !date ||
      !time ||
      !location?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Community, title, date, time and location are required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const event = await Event.create({
      community: communityId,
      createdBy: req.user._id,
      title: title.trim(),
      description: description?.trim() || "",
      date,
      time,
      location: location.trim(),
      coverImage: "",
      attendees: [],
    });

    const populatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: populatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// Get events for a community
export const getCommunityEvents = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const events = await Event.find({
      community: communityId,
    })
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city")
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// Join an event / RSVP
export const joinEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const userId = req.user._id.toString();

    const alreadyJoined = event.attendees.some(
      (id) => id.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    event.attendees.push(req.user._id);

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city")
      .populate("attendees", "name email profilePic");

    res.status(200).json({
      success: true,
      message: "Joined event successfully",
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single event by ID with attendee list
export const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city")
      .populate("attendees", "name email profilePic");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// Upload event cover image to Cloudinary
export const uploadEventCover = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const base64Image = req.file.buffer.toString("base64");

    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "hometown-hub/events",
    });

    event.coverImage = result.secure_url;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event cover image uploaded successfully",
      coverImage: event.coverImage,
    });
  } catch (error) {
    next(error);
  }
};