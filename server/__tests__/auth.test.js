
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from "@jest/globals";

jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { default: User } = await import("../models/User.js");

const { registerUser, loginUser } = await import(
  "../controllers/authController.js"
);

import bcrypt from "bcryptjs";

function createResponse() {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);

  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// REGISTRATION TESTS

describe("User Registration Tests", () => {
  test("should register a new user successfully", async () => {
    User.findOne.mockResolvedValue(null);

    User.create.mockImplementation(async (data) => ({
      _id: "test-user-id",
      name: data.name,
      email: data.email,
      password: data.password,
    }));

    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });

    expect(User.create).toHaveBeenCalledTimes(1);

    const savedUser = User.create.mock.calls[0][0];

    expect(savedUser.password).not.toBe("Password123");

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully",
        user: expect.objectContaining({
          name: "Test User",
          email: "test@example.com",
        }),
      })
    );
  });

  test("should reject registration when required fields are missing", async () => {
    const req = {
      body: {
        name: "",
        email: "test@example.com",
        password: "Password123",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Name, email and password are required",
    });

    expect(User.create).not.toHaveBeenCalled();
  });

  test("should reject registration when the user already exists", async () => {
    User.findOne.mockResolvedValue({
      _id: "existing-user-id",
      email: "test@example.com",
    });

    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User already exists",
    });

    expect(User.create).not.toHaveBeenCalled();
  });
});

// LOGIN TESTS

describe("User Login Tests", () => {
  test("should log in successfully with correct credentials", async () => {
    const hashedPassword = await bcrypt.hash("Password123", 10);

    const user = {
      _id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      isBlocked: false,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(user);
    process.env.JWT_SECRET = "test-secret-key";

    const req = {
      body: {
        email: " TEST@example.com ",
        password: "Password123",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });

    expect(user.save).toHaveBeenCalled();

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Login successful",
      })
    );
  });

  test("should reject an incorrect password", async () => {
    const hashedPassword = await bcrypt.hash(
      "CorrectPassword123",
      10
    );

    User.findOne.mockResolvedValue({
      _id: "test-user-id",
      email: "test@example.com",
      password: hashedPassword,
      isBlocked: false,
      save: jest.fn(),
    });

    const req = {
      body: {
        email: "test@example.com",
        password: "WrongPassword123",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("should prevent a blocked user from logging in", async () => {
    const hashedPassword = await bcrypt.hash("Password123", 10);

    const user = {
      _id: "blocked-user-id",
      email: "blocked@example.com",
      password: hashedPassword,
      isBlocked: true,
      save: jest.fn(),
    };

    User.findOne.mockResolvedValue(user);

    const req = {
      body: {
        email: "blocked@example.com",
        password: "Password123",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Your account has been blocked",
    });

    expect(user.save).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
