
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [notes, setNotes] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/reports");
      const data = response.data;

      setReports(
        Array.isArray(data)
          ? data
          : Array.isArray(data.reports)
            ? data.reports
            : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load abuse reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateStatus = async (reportId, status) => {
    const report = reports.find((item) => item._id === reportId);

    if (!report) return;

    if (
      status === "rejected" &&
      !window.confirm("Are you sure you want to reject this report?")
    ) {
      return;
    }

    try {
      setUpdatingId(reportId);
      setError("");
      setSuccess("");

      await API.put(`/admin/reports/${reportId}/status`, {
        status,
        adminNote: notes[reportId] ?? report.adminNote ?? "",
      });

      setReports((current) =>
        current.map((item) =>
          item._id === reportId
            ? {
                ...item,
                status,
                adminNote: notes[reportId] ?? item.adminNote ?? "",
              }
            : item
        )
      );

      setSuccess(`Report status updated to "${status}".`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update report status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      const searchableText = [
        report._id,
        report.reason,
        report.status,
        report.reportedBy?.name,
        report.reportedBy?.email,
        report.post?.content,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(query);
    });
  }, [reports, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((item) => item.status === "pending").length,
      reviewed: reports.filter((item) => item.status === "reviewed").length,
      resolved: reports.filter((item) => item.status === "resolved").length,
      rejected: reports.filter((item) => item.status === "rejected").length,
    }),
    [reports]
  );

  const statusStyle = (status) => {
    const colors = {
      pending: { background: "#fff7ed", color: "#c2410c" },
      reviewed: { background: "#eff6ff", color: "#1d4ed8" },
      resolved: { background: "#ecfdf5", color: "#047857" },
      rejected: { background: "#fef2f2", color: "#b91c1c" },
    };

    return colors[status] || { background: "#f3f4f6", color: "#374151" };
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "9px",
    padding: "10px 14px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "clamp(16px, 4vw, 36px)",
        boxSizing: "border-box",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                color: "#4f46e5",
                fontWeight: "700",
                fontSize: "12px",
                letterSpacing: "1.5px",
                margin: "0 0 8px",
              }}
            >
              HOMETOWN HUB · ADMINISTRATION
            </p>
            <h1 style={{ fontSize: "clamp(25px, 4vw, 34px)", margin: 0 }}>
              Abuse Reports
            </h1>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Review reported posts and manage community safety.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={{
                ...buttonStyle,
                background: "#e8eaf0",
                color: "#334155",
              }}
            >
              ← Admin Dashboard
            </button>

            <button
              type="button"
              onClick={fetchReports}
              disabled={loading || Boolean(updatingId)}
              style={{
                ...buttonStyle,
                background: "#4f46e5",
                color: "#fff",
                opacity: loading || updatingId ? 0.6 : 1,
              }}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total Reports", value: counts.total, color: "#4f46e5" },
            { label: "Pending", value: counts.pending, color: "#c2410c" },
            { label: "Reviewed", value: counts.reviewed, color: "#1d4ed8" },
            { label: "Resolved", value: counts.resolved, color: "#047857" },
            { label: "Rejected", value: counts.rejected, color: "#b91c1c" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#fff",
                border: "1px solid #e8ecf3",
                borderRadius: "15px",
                padding: "19px",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
              }}
            >
              <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: "13px" }}>
                {item.label}
              </p>
              <strong style={{ fontSize: "29px", color: item.color }}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "13px 16px",
              borderRadius: "10px",
              marginBottom: "18px",
            }}
          >
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              style={{
                float: "right",
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              background: "#ecfdf5",
              color: "#047857",
              padding: "13px 16px",
              borderRadius: "10px",
              marginBottom: "18px",
            }}
          >
            {success}
          </div>
        )}

        <section
          style={{
            background: "#fff",
            border: "1px solid #e8ecf3",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "22px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label
              htmlFor="report-search"
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "13px",
                marginBottom: "7px",
              }}
            >
              Search reports
            </label>
            <input
              id="report-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, email, reason, post..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #dbe1ea",
                borderRadius: "9px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="report-status"
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "13px",
                marginBottom: "7px",
              }}
            >
              Filter by status
            </label>
            <select
              id="report-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #dbe1ea",
                borderRadius: "9px",
                background: "#fff",
                fontSize: "14px",
              }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "45px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8ecf3",
              borderRadius: "15px",
              padding: "45px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🛡️</div>
            <h3 style={{ margin: "0 0 8px" }}>
              {reports.length === 0
                ? "No abuse reports found"
                : "No matching reports"}
            </h3>
            <p style={{ color: "#64748b", margin: 0 }}>
              {reports.length === 0
                ? "New reports submitted by community members will appear here."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {filteredReports.map((report) => {
              const currentStatus = report.status || "pending";
              const isUpdating = updatingId === report._id;

              return (
                <article
                  key={report._id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5eaf2",
                    borderRadius: "16px",
                    padding: "clamp(16px, 3vw, 24px)",
                    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.035)",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "18px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        REPORT ID
                      </p>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        #{report._id}
                      </h3>
                      <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: 0 }}>
                        {formatDate(report.createdAt)}
                      </p>
                    </div>

                    <span
                      style={{
                        ...statusStyle(currentStatus),
                        padding: "7px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "capitalize",
                      }}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "15px",
                        borderRadius: "11px",
                        minWidth: 0,
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", fontSize: "14px" }}>
                        Report details
                      </h4>
                      <p style={{ margin: "6px 0", fontSize: "13px" }}>
                        <strong>Reported by:</strong>{" "}
                        {report.reportedBy?.name || "Unknown user"}
                      </p>
                      <p
                        style={{
                          margin: "6px 0",
                          fontSize: "13px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <strong>Email:</strong>{" "}
                        {report.reportedBy?.email || "Not available"}
                      </p>
                      <p style={{ margin: "10px 0 5px", fontSize: "13px" }}>
                        <strong>Reason</strong>
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {report.reason || "No reason provided"}
                      </p>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "15px",
                        borderRadius: "11px",
                        minWidth: 0,
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", fontSize: "14px" }}>
                        Reported post
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {report.post?.content || "No text content"}
                      </p>

                      {report.post?.image && (
                        <img
                          src={report.post.image}
                          alt="Image from reported post"
                          loading="lazy"
                          style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "300px",
                            maxHeight: "260px",
                            objectFit: "contain",
                            borderRadius: "9px",
                            marginTop: "12px",
                            background: "#e2e8f0",
                          }}
                        />
                      )}

                      {!report.post && (
                        <p style={{ color: "#64748b", fontSize: "12px" }}>
                          The reported post may have been deleted.
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "18px" }}>
                    <label
                      htmlFor={`admin-note-${report._id}`}
                      style={{
                        display: "block",
                        fontWeight: "700",
                        fontSize: "13px",
                        marginBottom: "7px",
                      }}
                    >
                      Admin review note
                    </label>
                    <textarea
                      id={`admin-note-${report._id}`}
                      rows={3}
                      maxLength={1000}
                      value={notes[report._id] ?? report.adminNote ?? ""}
                      onChange={(event) =>
                        setNotes((previous) => ({
                          ...previous,
                          [report._id]: event.target.value,
                        }))
                      }
                      placeholder="Add a note about your decision..."
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px",
                        border: "1px solid #dbe1ea",
                        borderRadius: "9px",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        resize: "vertical",
                      }}
                    />
                    <p
                      style={{
                        textAlign: "right",
                        color: "#94a3b8",
                        fontSize: "11px",
                        margin: "4px 0 0",
                      }}
                    >
                      {(notes[report._id] ?? report.adminNote ?? "").length}/1000
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "9px",
                      marginTop: "14px",
                    }}
                  >
                    {[
                      {
                        status: "reviewed",
                        label: "Mark Reviewed",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                      },
                      {
                        status: "resolved",
                        label: "Mark Resolved",
                        background: "#d1fae5",
                        color: "#047857",
                      },
                      {
                        status: "rejected",
                        label: "Reject Report",
                        background: "#fee2e2",
                        color: "#b91c1c",
                      },
                      {
                        status: "pending",
                        label: "Mark Pending",
                        background: "#ffedd5",
                        color: "#c2410c",
                      },
                    ].map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        onClick={() => updateStatus(report._id, action.status)}
                        disabled={Boolean(updatingId) || currentStatus === action.status}
                        style={{
                          ...buttonStyle,
                          background: action.background,
                          color: action.color,
                          opacity:
                            updatingId || currentStatus === action.status
                              ? 0.55
                              : 1,
                          cursor:
                            updatingId || currentStatus === action.status
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isUpdating ? "Updating..." : action.label}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
            marginTop: "32px",
          }}
        >
          Hometown Hub · Admin Report Management
        </footer>
      </div>
    </div>
  );
}

export default AdminReports;
