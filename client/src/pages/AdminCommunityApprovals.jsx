
import { useEffect, useState } from "react";
import API from "../services/api";

function AdminCommunityApprovals() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchPendingCommunities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/communities/pending");

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data.communities || data.pendingCommunities || [];

      setCommunities(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load pending communities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCommunities();
  }, []);

  const handleAction = async (communityId, action) => {
    const actionLabel = action === "approve" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${actionLabel} this community?`)) {
      return;
    }

    try {
      setActionLoading(`${communityId}-${action}`);
      setError("");

      await API.put(`/admin/communities/${communityId}/${action}`);

      setCommunities((previous) =>
        previous.filter((community) => community._id !== communityId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${actionLabel} community.`
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Community Approvals</h1>
      <p>Review pending community requests.</p>

      <button
        type="button"
        onClick={() => window.history.back()}
        style={{ margin: "15px 0", padding: "9px 14px" }}
      >
        Back
      </button>

      {error && (
        <p style={{ color: "red", margin: "15px 0" }}>{error}</p>
      )}

      {loading ? (
        <p>Loading pending communities...</p>
      ) : communities.length === 0 ? (
        <p>No pending communities found.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
          {communities.map((community) => (
            <div
              key={community._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                background: "#fff",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {community.name || "Unnamed Community"}
              </h2>

              <p>
                <strong>City:</strong> {community.city || "Not provided"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {community.description || "No description provided"}
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={Boolean(actionLoading)}
                  onClick={() => handleAction(community._id, "approve")}
                  style={{
                    padding: "9px 14px",
                    background: "#15803d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {actionLoading === `${community._id}-approve`
                    ? "Approving..."
                    : "Approve"}
                </button>

                <button
                  type="button"
                  disabled={Boolean(actionLoading)}
                  onClick={() => handleAction(community._id, "reject")}
                  style={{
                    padding: "9px 14px",
                    background: "#b91c1c",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {actionLoading === `${community._id}-reject`
                    ? "Rejecting..."
                    : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCommunityApprovals;
