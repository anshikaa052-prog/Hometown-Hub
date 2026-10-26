
import Post from "../models/Post.js";
import Community from "../models/Community.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import cloudinary from "../config/cloudinary.js";

// Create a post
export const createPost = async (req, res, next) => {
  try {
    const { content, communityId, category, tags } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    if (!content?.trim() && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Post content or image is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadedImage = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "hometown-hub/posts" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      imageUrl = uploadedImage.secure_url;
    }

    // Parse tags received through FormData.
    let parsedTags = [];

    try {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === "string" && tags.trim()) {
        const parsed = JSON.parse(tags);

        parsedTags = Array.isArray(parsed)
          ? parsed
          : tags.split(",");
      }
    } catch {
      parsedTags =
        typeof tags === "string" ? tags.split(",") : [];
    }

    // Clean tags and remove duplicates.
    parsedTags = [
      ...new Set(
        parsedTags
          .filter((tag) => typeof tag === "string")
          .map((tag) => tag.trim().replace(/^#/, ""))
          .filter(Boolean)
          .map((tag) => tag.slice(0, 30))
      ),
    ].slice(0, 10);

    const post = await Post.create({
      content: content?.trim() || "",
      image: imageUrl,
      community: communityId,
      createdBy: req.user._id,
      category:
        typeof category === "string" && category.trim()
          ? category.trim()
          : "General",
      tags: parsedTags,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city");

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Get community posts with pagination
export const getCommunityPosts = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      50
    );

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const totalPosts = await Post.countDocuments({
      community: communityId,
    });

    const posts = await Post.find({ community: communityId })
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single post
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Update your own post
export const updatePost = async (req, res, next) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      });
    }

    if (typeof content === "string") {
      post.content = content.trim();
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("createdBy", "name email profilePic")
      .populate("community", "name city");

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a post
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const community = await Community.findById(post.community);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const userId = req.user._id.toString();
    const isPostOwner = post.createdBy.toString() === userId;
    const isCommunityCreator =
      community.createdBy.toString() === userId;

    const isModerator = (community.moderators || []).some(
      (id) => id.toString() === userId
    );

    if (!isPostOwner && !isCommunityCreator && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this post",
      });
    }

    // Delete the uploaded image from Cloudinary, if present.
    if (post.image) {
      try {
        const urlParts = post.image.split("/");
        const uploadIndex = urlParts.indexOf("upload");

        if (uploadIndex !== -1) {
          const publicIdWithExtension = urlParts
            .slice(uploadIndex + 2)
            .join("/")
            .replace(/\.[^/.]+$/, "");

          await cloudinary.uploader.destroy(publicIdWithExtension);
        }
      } catch (imageError) {
        console.error(
          "Cloudinary image deletion error:",
          imageError
        );
      }
    }

    await Post.findByIdAndDelete(post._id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Like or unlike a post
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id.toString();
    const postOwnerId = post.createdBy.toString();

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    // Notify the post owner when another user likes the post.
    if (!alreadyLiked && postOwnerId !== userId) {
      try {
        const notification = await Notification.create({
          recipient: post.createdBy,
          sender: req.user._id,
          type: "like",
          message: `${req.user.name} liked your post`,
          relatedPost: post._id,
        });

        const io = req.app.get("io");

        if (io) {
          io.to(postOwnerId).emit("newNotification", notification);
        }
      } catch (notificationError) {
        console.error(
          "Like notification error:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: alreadyLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    next(error);
  }
};

// Report a post
export const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const { postId } = req.params;

    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }

    if (reason.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Report reason cannot exceed 500 characters",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report your own post",
      });
    }

    const existingReport = await Report.findOne({
      reportedBy: req.user._id,
      post: post._id,
      status: { $in: ["pending", "reviewed"] },
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this post",
      });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      post: post._id,
      reason: reason.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Post reported successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};
