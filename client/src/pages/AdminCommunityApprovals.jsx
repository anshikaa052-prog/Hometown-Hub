
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminCommunityApprovals() {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchPendingCommunities = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPendingCommunities();
  }, [fetchPendingCommunities]);

  const filteredCommunities = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return communities;

    return communities.filter((community) =>
      [
        community.name,
        community.city,
        community.description,
      ].some((value) => (value || "").toLowerCase().includes(query))
    );
  }, [communities, search]);

  const handleAction = async (communityId, action) => {
    const community = communities.find(
      (item) => item._id === communityId
    );

    const actionLabel = action === "approve" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} "${community?.name || "this community"}"?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(`${communityId}-${action}`);
      setError("");
      setSuccess("");

      await API.put(`/admin/communities/${communityId}/${action}`);

      setCommunities((previous) =>
        previous.filter((item) => item._id !== communityId)
      );

      setSuccess(
        `"${community?.name || "Community"}" has been ${action === "approve" ? "approved" : "rejected"} successfully.`
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

  const styles = {
    page: {
      minHeight: "100vh",
      boxSizing: "border-box",
      padding: "28px 20px 48px",
      background: "#f4f7fc",
      color: "#1f2937",
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "18px",
      marginBottom: "26px",
    },
    eyebrow: {
      marginBottom: "9px",
      color: "#2862a8",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "1.5px",
    },
    title: {
      margin: "0 0 9px",
      color: "#173b72",
      fontSize: "clamp(27px, 4vw, 35px)",
    },
    subtitle: {
      margin: 0,
      color: "#687386",
      lineHeight: 1.7,
    },
    button: {
      padding: "11px 15px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      background: "#fff",
      color: "#24446f",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    hero: {
      marginBottom: "25px",
      padding: "27px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, #173b72, #3478c9)",
      color: "#fff",
    },
    heroLabel: {
      marginBottom: "11px",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "1.4px",
    },
    heroTitle: {
      margin: "0 0 10px",
      fontSize: "24px",
    },
    heroText: {
      maxWidth: "720px",
      margin: 0,
      color: "#e4edff",
      fontSize: "14px",
      lineHeight: 1.8,
    },
    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "16px",
      marginBottom: "25px",
    },
    statCard: {
      padding: "20px",
      border: "1px solid #e3eaf4",
      borderRadius: "13px",
      background: "#fff",
      boxShadow: "0 4px 14px rgba(20,45,85,0.04)",
    },
    statLabel: {
      marginBottom: "10px",
      color: "#687386",
      fontSize: "14px",
    },
    statValue: {
      color: "#173b72",
      fontSize: "30px",
      fontWeight: 700,
    },
    panel: {
      overflow: "hidden",
      border: "1px solid #e3eaf4",
      borderRadius: "14px",
      background: "#fff",
      boxShadow: "0 4px 14px rgba(20,45,85,0.04)",
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "14px",
      padding: "20px",
      borderBottom: "1px solid #e8edf5",
    },
    input: {
      flex: "1 1 240px",
      minWidth: 0,
      boxSizing: "border-box",
      padding: "12px 14px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      fontSize: "14px",
    },
    count: {
      padding: "8px 12px",
      borderRadius: "20px",
      background: "#fff3db",
      color: "#9a5b08",
      fontSize: "13px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
      gap: "18px",
      padding: "20px",
    },
    card: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      padding: "22px",
      border: "1px solid #e3eaf4",
      borderRadius: "12px",
      background: "#fff",
    },
    badge: {
      alignSelf: "flex-start",
      marginBottom: "15px",
      padding: "6px 10px",
      borderRadius: "20px",
      background: "#fff3db",
      color: "#9a5b08",
      fontSize: "12px",
      fontWeight: 700,
    },
    communityName: {
      margin: "0 0 12px",
      color: "#173b72",
      fontSize: "21px",
      lineHeight: 1.4,
      overflowWrap: "anywhere",
    },
    description: {
      flex: 1,
      margin: "0 0 18px",
      color: "#687386",
      fontSize: "14px",
      lineHeight: 1.8,
      overflowWrap: "anywhere",
    },
    detail: {
      marginBottom: "12px",
      padding: "12px",
      borderRadius: "8px",
      background: "#f7f9fd",
      color: "#475569",
      fontSize: "13px",
      lineHeight: 1.6,
      overflowWrap: "anywhere",
    },
    actions: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "auto",
    },
    actionButton: {
      flex: "1 1 110px",
      padding: "11px 12px",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
    },
    message: {
      margin: "18px 20px",
      padding: "13px 15px",
      borderRadius: "8px",
      fontSize: "14px",
      lineHeight: 1.7,
      overflowWrap: "anywhere",
    },
    empty: {
      padding: "42px 20px",
      textAlign: "center",
      color: "#687386",
      lineHeight: 1.8,
    },
    footer: {
      padding: "16px 20px",
      borderTop: "1px solid #e8edf5",
      color: "#718096",
      fontSize: "13px",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              HOMETOWN HUB / ADMINISTRATION
            </div>
            <h1 style={styles.title}>Community Approvals</h1>
            <p style={styles.subtitle}>
              Review community requests before they become available.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              style={styles.button}
              onClick={() => navigate("/admin")}
            >
              ← Admin Dashboard
            </button>

            <button
              type="button"
              style={{
                ...styles.button,
                opacity: loading || Boolean(actionLoading) ? 0.6 : 1,
              }}
              onClick={fetchPendingCommunities}
              disabled={loading || Boolean(actionLoading)}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroLabel}>COMMUNITY REVIEW CENTER</div>
          <h2 style={styles.heroTitle}>Help communities get started</h2>
          <p style={styles.heroText}>
            Review the submitted community details and approve appropriate
            requests or reject those that should not be published.
          </p>
        </section>

        <section style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending Requests</div>
            <div style={styles.statValue}>{communities.length}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Matching Search</div>
            <div style={styles.statValue}>{filteredCommunities.length}</div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.toolbar}>
            <input
              type="search"
              aria-label="Search pending communities"
              placeholder="Search by name, city, or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.input}
            />

            <span style={styles.count}>
              {communities.length} pending
            </span>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                ...styles.message,
                color: "#991b1b",
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                ...styles.message,
                color: "#166534",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              {success}
            </div>
          )}

          {loading ? (
            <div style={styles.empty}>Loading pending communities...</div>
          ) : communities.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: "34px", marginBottom: "10px" }}>
                ✓
              </div>
              <strong style={{ color: "#173b72" }}>
                All caught up!
              </strong>
              <div>There are no pending community requests right now.</div>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div style={styles.empty}>
              No pending communities match your search.
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredCommunities.map((community) => {
                const isApproving =
                  actionLoading === `${community._id}-approve`;
                const isRejecting =
                  actionLoading === `${community._id}-reject`;
                const isBusy = Boolean(actionLoading);

                return (
                  <article key={community._id} style={styles.card}>
                    <span style={styles.badge}>Pending review</span>

                    <h2 style={styles.communityName}>
                      {community.name || "Unnamed Community"}
                    </h2>

                    <div style={styles.detail}>
                      <strong>City:</strong>{" "}
                      {community.city || "Not provided"}
                    </div>

                    {community.state && (
                      <div style={styles.detail}>
                        <strong>State:</strong> {community.state}
                      </div>
                    )}

                    {community.country && (
                      <div style={styles.detail}>
                        <strong>Country:</strong> {community.country}
                      </div>
                    )}

                    <p style={styles.description}>
                      {community.description ||
                        "No description provided."}
                    </p>

                    <div style={styles.actions}>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleAction(community._id, "approve")
                        }
                        style={{
                          ...styles.actionButton,
                          background: "#15803d",
                          opacity: isBusy ? 0.65 : 1,
                        }}
                      >
                        {isApproving ? "Approving..." : "✓ Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleAction(community._id, "reject")
                        }
                        style={{
                          ...styles.actionButton,
                          background: "#b91c1c",
                          opacity: isBusy ? 0.65 : 1,
                        }}
                      >
                        {isRejecting ? "Rejecting..." : "✕ Reject"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && communities.length > 0 && (
            <div style={styles.footer}>
              Showing {filteredCommunities.length} of {communities.length} pending requests
            </div>
          )}
        </section>

        <footer
          style={{
            marginTop: "28px",
            color: "#8791a1",
            textAlign: "center",
            fontSize: "13px",
          }}
        >
          Hometown Hub · Community Administration
        </footer>
      </div>
    </main>
  );
}

export default AdminCommunityApprovals;
