
import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/Event.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/Community.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

const { default: Event } = await import("../models/Event.js");
const { joinEvent } = await import("../controllers/eventController.js");

describe("Event RSVP Tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { eventId: "event123" },
      user: { _id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  test("should return 404 when event does not exist", async () => {
    Event.findById.mockResolvedValue(null);

    await joinEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Event not found",
    });
  });

  test("should return 400 when user already joined", async () => {
    Event.findById.mockResolvedValue({
      attendees: ["user123"],
      save: jest.fn(),
    });

    await joinEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You have already joined this event",
    });
  });

  test("should pass database errors to next", async () => {
    const error = new Error("Database error");

    Event.findById.mockRejectedValue(error);

    await joinEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
