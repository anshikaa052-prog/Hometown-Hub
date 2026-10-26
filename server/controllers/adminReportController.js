
import Report from "../models/Report.js";

// Get all abuse reports
export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("post")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// Update report status
export const updateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "resolved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.status = status;

    if (typeof adminNote === "string") {
      report.adminNote = adminNote.trim();
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};
