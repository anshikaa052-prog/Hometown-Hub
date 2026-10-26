
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from "@jest/globals";

jest.unstable_mockModule("../models/Post.js", () => ({
  default: {
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/Community.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/Notification.js", () => ({
  default: {
    create: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/Report.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.unstable_mockModule("../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

const { default: Post } = await import("../models/Post.js");
const { default: Community } = await import("../models/Community.js");
const { default: Notification } = await import("../models/Notification.js");

const { createPost, toggleLike } = await import(
  "../controllers/postController.js"
);

function createResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// CREATE POST TESTS
describe("Create Post Tests", () => {
  test("should create a post successfully", async () => {
    const req = {
      body: {
        content: "Hello from my community",
        communityId: "community-id",
        category: "General",
        tags: JSON.stringify(["#hello", "community"]),
      },
      user: {
        _id: "user-id",
        name: "Test User",
      },
    };

    const community = { _id: "community-id" };

    const post = {
      _id: "post-id",
      content: "Hello from my community",
      community: "community-id",
      createdBy: "user-id",
      category: "General",
      tags: ["hello", "community"],
      image: "",
    };

    const populatedPost = {
      ...post,
      createdBy: { name: "Test User" },
    };

    Community.findById.mockResolvedValue(community);
    Post.create.mockResolvedValue(post);

    Post.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(populatedPost),
      }),
    });

    const res = createResponse();
    const next = jest.fn();

    await createPost(req, res, next);

    expect(Community.findById).toHaveBeenCalledWith("community-id");
    expect(Post.create).toHaveBeenCalledWith({
      content: "Hello from my community",
      image: "",
      community: "community-id",
      createdBy: "user-id",
      category: "General",
      tags: ["hello", "community"],
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject post creation when community ID is missing", async () => {
    const req = {
      body: { content: "Hello community" },
      user: { _id: "user-id" },
    };

    const res = createResponse();
    const next = jest.fn();

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Community ID is required",
    });
    expect(Post.create).not.toHaveBeenCalled();
  });

  test("should reject post creation when content and image are missing", async () => {
    const req = {
      body: {
        content: "   ",
        communityId: "community-id",
      },
      user: { _id: "user-id" },
    };

    const res = createResponse();
    const next = jest.fn();

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post content or image is required",
    });
    expect(Post.create).not.toHaveBeenCalled();
  });

  test("should return 404 when the community does not exist", async () => {
    Community.findById.mockResolvedValue(null);

    const req = {
      body: {
        content: "Hello community",
        communityId: "missing-community-id",
      },
      user: { _id: "user-id" },
    };

    const res = createResponse();
    const next = jest.fn();

    await createPost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Community not found",
    });
    expect(Post.create).not.toHaveBeenCalled();
  });
});

// LIKE / UNLIKE POST TESTS
describe("Like Post Tests", () => {
  test("should like a post successfully", async () => {
    const post = {
      _id: "post-id",
      createdBy: "owner-id",
      likes: [],
      save: jest.fn().mockResolvedValue(true),
    };

    Post.findById.mockResolvedValue(post);
    Notification.create.mockResolvedValue({ _id: "notification-id" });

    const req = {
      params: { postId: "post-id" },
      user: {
        _id: "liker-id",
        name: "Test User",
      },
      app: {
        get: jest.fn().mockReturnValue(null),
      },
    };

    const res = createResponse();
    const next = jest.fn();

    await toggleLike(req, res, next);

    expect(post.likes).toContain("liker-id");
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post liked successfully",
      likesCount: 1,
      liked: true,
    });
    expect(Notification.create).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should unlike a post that the user already liked", async () => {
    const post = {
      _id: "post-id",
      createdBy: "owner-id",
      likes: ["liker-id"],
      save: jest.fn().mockResolvedValue(true),
    };

    Post.findById.mockResolvedValue(post);

    const req = {
      params: { postId: "post-id" },
      user: {
        _id: "liker-id",
        name: "Test User",
      },
      app: {
        get: jest.fn(),
      },
    };

    const res = createResponse();
    const next = jest.fn();

    await toggleLike(req, res, next);

    expect(post.likes).toEqual([]);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post unliked successfully",
      likesCount: 0,
      liked: false,
    });
    expect(Notification.create).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 404 when the post does not exist", async () => {
    Post.findById.mockResolvedValue(null);

    const req = {
      params: { postId: "missing-post-id" },
      user: { _id: "liker-id", name: "Test User" },
    };

    const res = createResponse();
    const next = jest.fn();

    await toggleLike(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should not notify the owner when liking their own post", async () => {
    const post = {
      _id: "post-id",
      createdBy: "same-user-id",
      likes: [],
      save: jest.fn().mockResolvedValue(true),
    };

    Post.findById.mockResolvedValue(post);

    const req = {
      params: { postId: "post-id" },
      user: {
        _id: "same-user-id",
        name: "Test User",
      },
      app: {
        get: jest.fn().mockReturnValue(null),
      },
    };

    const res = createResponse();
    const next = jest.fn();

    await toggleLike(req, res, next);

    expect(post.likes).toContain("same-user-id");
    expect(post.save).toHaveBeenCalled();
    expect(Notification.create).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post liked successfully",
      likesCount: 1,
      liked: true,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
