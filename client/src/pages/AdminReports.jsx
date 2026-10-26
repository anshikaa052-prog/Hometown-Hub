
import { useEffect, useState } from "react";
import API from "../services/api";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [notes, setNotes] = useState({});

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/reports");
      setReports(response.data.reports || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load abuse reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (reportId, status) => {
    try {
      setUpdatingId(reportId);
      setError("");

      await API.put(`/admin/reports/${reportId}/status`, {
        status,
        adminNote: notes[reportId] || "",
      });

      await fetchReports();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update report status"
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading reports...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <h1>Abuse Reports</h1>
      <p>Review reports submitted by community members.</p>

      {error && (
        <p style={{ color: "red" }} role="alert">
          {error}
        </p>
      )}

      <button onClick={fetchReports} disabled={Boolean(updatingId)}>
        Refresh Reports
      </button>

      {reports.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No abuse reports found.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
          {reports.map((report) => (
            <article
              key={report._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <h3>Report #{report._id}</h3>

              <p>
                <strong>Reported by:</strong>{" "}
                {report.reportedBy?.name || "Unknown user"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {report.reportedBy?.email || "Not available"}
              </p>

              <p>
                <strong>Post content:</strong>{" "}
                {report.post?.content || "No text content"}
              </p>

              {report.post?.image && (
                <img
                  src={report.post.image}
                  alt="Reported post"
                  style={{
                    display: "block",
                    maxWidth: "250px",
                    maxHeight: "250px",
                    objectFit: "contain",
                    marginTop: "8px",
                  }}
                />
              )}

              <p>
                <strong>Reason:</strong> {report.reason}
              </p>

              <p>
                <strong>Status:</strong> {report.status}
              </p>

              <p>
                <strong>Admin note:</strong>{" "}
                {report.adminNote || "No note added"}
              </p>

              <label
                htmlFor={`note-${report._id}`}
                style={{ display: "block", marginTop: "12px" }}
              >
                Admin note
              </label>

              <textarea
                id={`note-${report._id}`}
                rows={3}
                value={notes[report._id] ?? report.adminNote ?? ""}
                onChange={(event) =>
                  setNotes((previous) => ({
                    ...previous,
                    [report._id]: event.target.value,
                  }))
                }
                placeholder="Enter your review note"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: "6px",
                  padding: "8px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={() => updateStatus(report._id, "reviewed")}
                  disabled={Boolean(updatingId)}
                >
                  {updatingId === report._id ? "Updating..." : "Mark Reviewed"}
                </button>

                <button
                  onClick={() => updateStatus(report._id, "resolved")}
                  disabled={Boolean(updatingId)}
                >
                  Mark Resolved
                </button>

                <button
                  onClick={() => updateStatus(report._id, "rejected")}
                  disabled={Boolean(updatingId)}
                >
                  Reject Report
                </button>

                <button
                  onClick={() => updateStatus(report._id, "pending")}
                  disabled={Boolean(updatingId)}
                >
                  Mark Pending
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminReports;
