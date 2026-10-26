import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Community from "../models/Community.js";

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      post: postId,
      createdBy: req.userId,
    });

    const populatedComment = await Comment.findById(
      comment._id
    ).populate("createdBy", "name email profilePic");

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create comment",
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: postId,
    })
      .populate("createdBy", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the comment creator can update this comment",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    comment.content = content.trim();

    await comment.save();

    const updatedComment = await Comment.findById(
      comment._id
    ).populate("createdBy", "name email profilePic");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const post = await Post.findById(comment.post);

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

    const userId = req.userId.toString();

    const isCommentOwner =
      comment.createdBy.toString() === userId;

    const isCommunityCreator =
      community.createdBy.toString() === userId;

    const isModerator = (community.moderators || []).some(
      (id) => id.toString() === userId
    );

    if (
      !isCommentOwner &&
      !isCommunityCreator &&
      !isModerator
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};