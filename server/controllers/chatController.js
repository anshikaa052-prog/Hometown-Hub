import ChatMessage from "../models/ChatMessage.js";
import Community from "../models/Community.js";

// Get community chat messages
export const getChatMessages = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Join the community to access its chat",
      });
    }

    const messages = await ChatMessage.find({ community: communityId })
      .populate("sender", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

// Send a community chat message
export const sendChatMessage = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Join the community to send messages",
      });
    }

    const chatMessage = await ChatMessage.create({
      community: communityId,
      sender: req.userId,
      message: message.trim(),
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate("sender", "name");

    const io = req.app.get("io");

    if (io) {
      io.to(`community:${communityId}`).emit(
        "newChatMessage",
        populatedMessage
      );
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};