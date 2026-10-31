import Community from "../models/Community.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// Create community
export const createCommunity = async (req, res) => {
  try {
    const { name, city, description } = req.body;

    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: "Community name and city are required",
      });
    }

    const community = await Community.create({
      name,
      city,
      description,
      createdBy: req.userId,
      members: [req.userId],
      moderators: [],
      joinRequests: [],
    });

    res.status(201).json({
      success: true,
      message: "Community created successfully. Awaiting admin approval.",
      community,
    });
  } catch (error) {
    console.error("Create community error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create community",
    });
  }
};

// Get approved communities
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      approvalStatus: "approved",
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("moderators", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      communities,
    });
  } catch (error) {
    console.error("Get communities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
    });
  }
};

// Search approved communities by name or city
export const searchCommunities = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchTerm = search.trim();

    const communities = await Community.find({
      approvalStatus: "approved",
      $or: [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          city: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ],
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("moderators", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      communities,
    });
  } catch (error) {
    console.error("Search communities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search communities",
    });
  }
};

// Submit a join request
export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (community.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Community is not approved yet",
      });
    }

    const userId = req.userId.toString();

    const isMember = (community.members || []).some(
      (id) => id.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community",
      });
    }

    const hasPendingRequest = (
      community.joinRequests || []
    ).some((id) => id.toString() === userId);

    if (hasPendingRequest) {
      return res.status(400).json({
        success: false,
        message: "Join request already submitted",
      });
    }

    community.joinRequests.push(req.userId);

    await community.save();

    res.status(200).json({
      success: true,
      message: "Join request submitted successfully",
      joinRequests: community.joinRequests,
    });
  } catch (error) {
    console.error("Join community error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit join request",
    });
  }
};

// Get an approved community by ID
export const getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findOne({
      _id: communityId,
      approvalStatus: "approved",
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("moderators", "name email");

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found or not approved yet",
      });
    }

    res.status(200).json({
      success: true,
      community: {
        _id: community._id,
        id: community._id,
        name: community.name,
        city: community.city || "",
        state: community.state || "",
        country: community.country || "",
        description: community.description || "",
        coverImage: community.coverImage || "",
        createdBy: community.createdBy,
        members: community.members || [],
        moderators: community.moderators || [],
        memberCount: (community.members || []).length,
      },
    });
  } catch (error) {
    console.error("Get community error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch community",
    });
  }
};

// Upload community cover image
export const uploadCommunityCover = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (
      community.createdBy.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the community creator can upload the cover image",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hometown-hub/community-covers",
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    community.coverImage = result.secure_url;

    await community.save();

    res.status(200).json({
      success: true,
      message: "Community cover image uploaded successfully",
      coverImage: community.coverImage,
    });
  } catch (error) {
    console.error("Community cover upload error:", error);

    res.status(500).json({
      success: false,
      message: "Community cover image upload failed",
    });
  }
};

// Assign a moderator
export const assignModerator = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (
      community.createdBy.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the community creator can manage moderators",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMember = (community.members || []).some(
      (id) => id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User must be a community member first",
      });
    }

    if (community.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Community creator cannot be assigned as a moderator",
      });
    }

    const alreadyModerator = (
      community.moderators || []
    ).some((id) => id.toString() === userId.toString());

    if (alreadyModerator) {
      return res.status(400).json({
        success: false,
        message: "User is already a moderator",
      });
    }

    community.moderators.push(userId);

    await community.save();

    res.status(200).json({
      success: true,
      message: "Moderator assigned successfully",
      moderators: community.moderators,
    });
  } catch (error) {
    console.error("Assign moderator error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign moderator",
    });
  }
};

// Remove a moderator
export const removeModerator = async (req, res) => {
  try {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (
      community.createdBy.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the community creator can manage moderators",
      });
    }

    const isModerator = (community.moderators || []).some(
      (id) => id.toString() === userId.toString()
    );

    if (!isModerator) {
      return res.status(404).json({
        success: false,
        message: "Moderator not found",
      });
    }

    community.moderators = (
      community.moderators || []
    ).filter((id) => id.toString() !== userId.toString());

    await community.save();

    res.status(200).json({
      success: true,
      message: "Moderator removed successfully",
      moderators: community.moderators,
    });
  } catch (error) {
    console.error("Remove moderator error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove moderator",
    });
  }
};

// Check who can manage join requests
const canManageJoinRequests = (community, userId) => {
  const isCreator =
    community.createdBy.toString() === userId.toString();

  const isModerator = (community.moderators || []).some(
    (id) => id.toString() === userId.toString()
  );

  return isCreator || isModerator;
};

// Get pending join requests
export const getJoinRequests = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId).populate(
      "joinRequests",
      "name email"
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!canManageJoinRequests(community, req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or a moderator can manage join requests",
      });
    }

    res.status(200).json({
      success: true,
      joinRequests: community.joinRequests || [],
    });
  } catch (error) {
    console.error("Get join requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch join requests",
    });
  }
};

// Approve a join request
export const approveJoinRequest = async (req, res) => {
  try {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!canManageJoinRequests(community, req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or a moderator can manage join requests",
      });
    }

    const hasRequest = (community.joinRequests || []).some(
      (id) => id.toString() === userId.toString()
    );

    if (!hasRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    const alreadyMember = (community.members || []).some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyMember) {
      community.members.push(userId);
    }

    community.joinRequests = (
      community.joinRequests || []
    ).filter((id) => id.toString() !== userId.toString());

    await community.save();

    res.status(200).json({
      success: true,
      message: "Join request approved successfully",
    });
  } catch (error) {
    console.error("Approve join request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve join request",
    });
  }
};

// Reject a join request
export const rejectJoinRequest = async (req, res) => {
  try {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!canManageJoinRequests(community, req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or a moderator can manage join requests",
      });
    }

    const hasRequest = (community.joinRequests || []).some(
      (id) => id.toString() === userId.toString()
    );

    if (!hasRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    community.joinRequests = (
      community.joinRequests || []
    ).filter((id) => id.toString() !== userId.toString());

    await community.save();

    res.status(200).json({
      success: true,
      message: "Join request rejected successfully",
    });
  } catch (error) {
    console.error("Reject join request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject join request",
    });
  }
};