
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from "@jest/globals";

jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

const { default: User } = await import("../models/User.js");

const { protect, adminOnly } = await import(
  "../middleware/authMiddleware.js"
);

import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret-key";

function createResponse() {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
}

function createNext() {
  return jest.fn();
}

describe("Protected Route Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should reject request when token is missing", async () => {
    const req = {
      cookies: {},
      headers: {},
    };

    const res = createResponse();
    const next = createNext();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authorized, token is missing",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should allow access with a valid token", async () => {
    const token = jwt.sign(
      { userId: "test-user-id" },
      process.env.JWT_SECRET
    );

    const user = {
      _id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      isBlocked: false,
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    const req = {
      cookies: { token },
      headers: {},
    };

    const res = createResponse();
    const next = createNext();

    await protect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("test-user-id");
    expect(req.user).toEqual(user);
    expect(req.userId).toBe("test-user-id");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should reject an invalid token", async () => {
    const req = {
      cookies: { token: "invalid-token" },
      headers: {},
    };

    const res = createResponse();
    const next = createNext();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token is invalid or expired",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should reject a blocked user", async () => {
    const token = jwt.sign(
      { userId: "blocked-user-id" },
      process.env.JWT_SECRET
    );

    const blockedUser = {
      _id: "blocked-user-id",
      name: "Blocked User",
      email: "blocked@example.com",
      role: "user",
      isBlocked: true,
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(blockedUser),
    });

    const req = {
      cookies: { token },
      headers: {},
    };

    const res = createResponse();
    const next = createNext();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Your account has been blocked",
    });

    expect(next).not.toHaveBeenCalled();
  });
});

describe("Admin Authorization Tests", () => {
  test("should allow an admin to access the route", () => {
    const req = {
      user: {
        _id: "admin-user-id",
        role: "admin",
      },
    };

    const res = createResponse();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should deny access to a normal user", () => {
    const req = {
      user: {
        _id: "normal-user-id",
        role: "user",
      },
    };

    const res = createResponse();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Admin access required",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should deny access when user is not authenticated", () => {
    const req = {};

    const res = createResponse();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required",
    });

    expect(next).not.toHaveBeenCalled();
  });
});
