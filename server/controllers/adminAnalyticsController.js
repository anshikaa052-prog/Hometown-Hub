import User from "../models/User.js";
import Community from "../models/Community.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import Event from "../models/Event.js";

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const last24Hours = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const [
      totalUsers,
      blockedUsers,
      totalCommunities,
      totalPosts,
      totalReports,
      pendingReports,
      approvedCommunities,
      pendingCommunities,
      dailyActiveUsers,
      totalComments,
      postsWithLikes,
      totalEvents,
      eventsWithAttendees,
      communitiesOverTime,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      Community.countDocuments(),
      Post.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Community.countDocuments({ approvalStatus: "approved" }),
      Community.countDocuments({ approvalStatus: "pending" }),
      User.countDocuments({
        lastActiveAt: { $gte: last24Hours },
      }),
      Comment.countDocuments(),
      Post.find({}, { likes: 1 }),
      Event.countDocuments(),
      Event.find({}, { attendees: 1 }),
      Community.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const totalLikes = postsWithLikes.reduce(
      (sum, post) => sum + (post.likes?.length || 0),
      0
    );

    const engagementRate =
      totalPosts > 0
        ? Number(
            ((totalLikes + totalComments) / totalPosts).toFixed(2)
          )
        : 0;

    const totalAttendees = eventsWithAttendees.reduce(
      (sum, event) => sum + (event.attendees?.length || 0),
      0
    );

    const eventParticipationRate =
      totalEvents > 0
        ? Number((totalAttendees / totalEvents).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        blockedUsers,
        totalCommunities,
        totalPosts,
        totalReports,
        pendingReports,
        approvedCommunities,
        pendingCommunities,
        dailyActiveUsers,
        totalLikes,
        totalComments,
        engagementRate,
        totalEvents,
        totalAttendees,
        eventParticipationRate,
        communitiesOverTime,
      },
    });
  } catch (error) {
    next(error);
  }
};
