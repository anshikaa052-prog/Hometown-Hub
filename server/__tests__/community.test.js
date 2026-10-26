
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from "@jest/globals";

jest.unstable_mockModule("../models/Community.js", () => ({
  default: {
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

const { default: Community } = await import("../models/Community.js");

const { createCommunity, joinCommunity } = await import(
  "../controllers/communityController.js"
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

// CREATE COMMUNITY TESTS
describe("Create Community Tests", () => {
  test("should create a community successfully", async () => {
    const req = {
      userId: "creator-id",
      body: {
        name: "Meerut Community",
        city: "Meerut",
        description: "Community for local people",
      },
    };

    const community = {
      _id: "community-id",
      name: "Meerut Community",
      city: "Meerut",
      description: "Community for local people",
    };

    Community.create.mockResolvedValue(community);

    const res = createResponse();

    await createCommunity(req, res);

    expect(Community.create).toHaveBeenCalledWith({
      name: "Meerut Community",
      city: "Meerut",
      description: "Community for local people",
      createdBy: "creator-id",
      members: ["creator-id"],
      moderators: [],
      joinRequests: [],
    });

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message:
        "Community created successfully. Awaiting admin approval.",
      community,
    });
  });

  test("should reject community creation when name is missing", async () => {
    const req = {
      userId: "creator-id",
      body: {
        name: "",
        city: "Meerut",
        description: "Test community",
      },
    };

    const res = createResponse();

    await createCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Community name and city are required",
    });
    expect(Community.create).not.toHaveBeenCalled();
  });

  test("should reject community creation when city is missing", async () => {
    const req = {
      userId: "creator-id",
      body: {
        name: "Meerut Community",
        city: "",
        description: "Test community",
      },
    };

    const res = createResponse();

    await createCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Community name and city are required",
    });
    expect(Community.create).not.toHaveBeenCalled();
  });
});

// JOIN COMMUNITY TESTS
describe("Join Community Tests", () => {
  test("should submit a join request successfully", async () => {
    const community = {
      approvalStatus: "approved",
      members: ["existing-member"],
      joinRequests: [],
      save: jest.fn().mockResolvedValue(true),
    };

    Community.findById.mockResolvedValue(community);

    const req = {
      params: { communityId: "community-id" },
      userId: "new-user-id",
    };

    const res = createResponse();

    await joinCommunity(req, res);

    expect(Community.findById).toHaveBeenCalledWith("community-id");
    expect(community.joinRequests).toContain("new-user-id");
    expect(community.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Join request submitted successfully",
      joinRequests: ["new-user-id"],
    });
  });

  test("should reject a join request for an unapproved community", async () => {
    const community = {
      approvalStatus: "pending",
      members: [],
      joinRequests: [],
      save: jest.fn(),
    };

    Community.findById.mockResolvedValue(community);

    const req = {
      params: { communityId: "community-id" },
      userId: "new-user-id",
    };

    const res = createResponse();

    await joinCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Community is not approved yet",
    });
    expect(community.save).not.toHaveBeenCalled();
  });

  test("should return 404 when the community does not exist", async () => {
    Community.findById.mockResolvedValue(null);

    const req = {
      params: { communityId: "missing-community-id" },
      userId: "new-user-id",
    };

    const res = createResponse();

    await joinCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Community not found",
    });
  });
});
