
import Community from "../models/Community.js";

// Get communities awaiting admin approval
export const getPendingCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      approvalStatus: "pending",
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      communities,
    });
  } catch (error) {
    console.error("Get pending communities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending communities",
    });
  }
};

// Approve a community
export const approveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    community.approvalStatus = "approved";
    await community.save();

    res.status(200).json({
      success: true,
      message: "Community approved successfully",
      community,
    });
  } catch (error) {
    console.error("Approve community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve community",
    });
  }
};

// Reject a community
export const rejectCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    community.approvalStatus = "rejected";
    await community.save();

    res.status(200).json({
      success: true,
      message: "Community rejected successfully",
      community,
    });
  } catch (error) {
    console.error("Reject community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject community",
    });
  }
};
