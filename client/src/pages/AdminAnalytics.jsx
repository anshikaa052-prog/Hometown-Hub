
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/analytics");
      setAnalytics(response.data.analytics || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const metrics = [
    {
      title: "Total Users",
      key: "totalUsers",
      description: "Registered platform members",
      color: "#245da8",
      background: "#e8f0ff",
      icon: "👥",
    },
    {
      title: "Daily Active Users",
      key: "dailyActiveUsers",
      description: "Active in the last 24 hours",
      color: "#087f8c",
      background: "#e0f7fa",
      icon: "📈",
    },
    {
      title: "Blocked Users",
      key: "blockedUsers",
      description: "Accounts currently blocked",
      color: "#c24141",
      background: "#feecec",
      icon: "🚫",
    },
    {
      title: "Total Communities",
      key: "totalCommunities",
      description: "Communities on the platform",
      color: "#7542b8",
      background: "#f1e8ff",
      icon: "🏘️",
    },
    {
      title: "Approved Communities",
      key: "approvedCommunities",
      description: "Approved and available",
      color: "#15803d",
      background: "#e5f8eb",
      icon: "✅",
    },
    {
      title: "Pending Communities",
      key: "pendingCommunities",
      description: "Awaiting approval",
      color: "#b76b08",
      background: "#fff3db",
      icon: "⏳",
    },
    {
      title: "Total Posts",
      key: "totalPosts",
      description: "Posts shared by members",
      color: "#245da8",
      background: "#e8f0ff",
      icon: "📝",
    },
    {
      title: "Total Likes",
      key: "totalLikes",
      description: "Likes across the platform",
      color: "#c24168",
      background: "#ffe9f0",
      icon: "❤️",
    },
    {
      title: "Total Comments",
      key: "totalComments",
      description: "Community conversations",
      color: "#7542b8",
      background: "#f1e8ff",
      icon: "💬",
    },
    {
      title: "Engagement Rate",
      key: "engagementRate",
      description: "Average likes and comments per post",
      color: "#087f8c",
      background: "#e0f7fa",
      icon: "📊",
    },
    {
      title: "Total Events",
      key: "totalEvents",
      description: "Events created on the platform",
      color: "#b76b08",
      background: "#fff3db",
      icon: "📅",
    },
    {
      title: "Total Attendees",
      key: "totalAttendees",
      description: "Event attendee registrations",
      color: "#15803d",
      background: "#e5f8eb",
      icon: "🎉",
    },
    {
      title: "Average Event Attendance",
      key: "eventParticipationRate",
      description: "Average attendees per event",
      color: "#7542b8",
      background: "#f1e8ff",
      icon: "🙌",
    },
    {
      title: "Total Reports",
      key: "totalReports",
      description: "Reports submitted by members",
      color: "#c24141",
      background: "#feecec",
      icon: "🚩",
    },
    {
      title: "Pending Reports",
      key: "pendingReports",
      description: "Reports awaiting review",
      color: "#b76b08",
      background: "#fff3db",
      icon: "🔎",
    },
  ];

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
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "18px",
      marginBottom: "26px",
    },
    eyebrow: {
      color: "#2862a8",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "1.5px",
      marginBottom: "9px",
    },
    title: {
      margin: "0 0 10px",
      color: "#173b72",
      fontSize: "clamp(27px, 4vw, 36px)",
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
      marginBottom: "28px",
      padding: "28px",
      borderRadius: "17px",
      background: "linear-gradient(135deg, #173b72, #3478c9)",
      color: "#fff",
    },
    heroLabel: {
      marginBottom: "12px",
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
      margin: 0,
      maxWidth: "720px",
      color: "#e4edff",
      lineHeight: 1.8,
      fontSize: "14px",
    },
    sectionTitle: {
      margin: "0 0 7px",
      color: "#173b72",
      fontSize: "23px",
    },
    sectionDescription: {
      margin: "0 0 20px",
      color: "#687386",
      lineHeight: 1.6,
      fontSize: "14px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 225px), 1fr))",
      gap: "17px",
    },
    card: {
      minWidth: 0,
      boxSizing: "border-box",
      padding: "20px",
      border: "1px solid #e3eaf4",
      borderRadius: "14px",
      background: "#fff",
      boxShadow: "0 4px 14px rgba(20,45,85,0.04)",
    },
    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "18px",
    },
    cardIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "43px",
      height: "43px",
      borderRadius: "12px",
      fontSize: "21px",
      flexShrink: 0,
    },
    cardLabel: {
      margin: "0 0 10px",
      color: "#687386",
      fontSize: "14px",
      lineHeight: 1.5,
    },
    cardValue: {
      margin: "0 0 10px",
      fontSize: "clamp(25px, 3vw, 31px)",
      fontWeight: 700,
      lineHeight: 1.25,
      overflowWrap: "anywhere",
    },
    cardDescription: {
      margin: 0,
      color: "#7b8494",
      fontSize: "12px",
      lineHeight: 1.6,
    },
    panel: {
      marginTop: "30px",
      padding: "24px",
      border: "1px solid #e3eaf4",
      borderRadius: "14px",
      background: "#fff",
      boxShadow: "0 4px 14px rgba(20,45,85,0.04)",
    },
    growthItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      padding: "15px",
      borderRadius: "9px",
      background: "#f7f9fd",
      marginBottom: "10px",
    },
    message: {
      padding: "20px",
      borderRadius: "10px",
      background: "#fff",
      lineHeight: 1.7,
    },
    footer: {
      marginTop: "30px",
      color: "#8791a1",
      textAlign: "center",
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
            <h1 style={styles.title}>Platform Analytics</h1>
            <p style={styles.subtitle}>
              Monitor users, communities, engagement, events, and reports.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                opacity: loading ? 0.6 : 1,
              }}
              onClick={fetchAnalytics}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh Data"}
            </button>
          </div>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroLabel}>PLATFORM OVERVIEW</div>
          <h2 style={styles.heroTitle}>Your community at a glance</h2>
          <p style={styles.heroText}>
            Review platform activity, track community growth, and monitor
            member engagement from one place. Statistics are loaded from
            your Hometown Hub analytics API.
          </p>
        </section>

        {loading && (
          <div role="status" style={styles.message}>
            Loading platform analytics...
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            style={{
              ...styles.message,
              color: "#991b1b",
              background: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            <p style={{ marginTop: 0 }}>{error}</p>
            <button
              type="button"
              style={styles.button}
              onClick={fetchAnalytics}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && analytics && (
          <>
            <section>
              <h2 style={styles.sectionTitle}>Key Statistics</h2>
              <p style={styles.sectionDescription}>
                Current totals and activity metrics reported by the backend.
              </p>

              <div style={styles.grid}>
                {metrics.map((metric) => {
                  const value = analytics[metric.key];
                  const displayValue =
                    value === null || value === undefined || value === ""
                      ? "—"
                      : typeof value === "number"
                        ? Number.isInteger(value)
                          ? value.toLocaleString()
                          : value.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                        : value;

                  return (
                    <article key={metric.key} style={styles.card}>
                      <div style={styles.cardTop}>
                        <div style={styles.cardLabel}>{metric.title}</div>
                        <div
                          style={{
                            ...styles.cardIcon,
                            color: metric.color,
                            background: metric.background,
                          }}
                          aria-hidden="true"
                        >
                          {metric.icon}
                        </div>
                      </div>

                      <p
                        style={{
                          ...styles.cardValue,
                          color: metric.color,
                        }}
                      >
                        {displayValue}
                      </p>

                      <p style={styles.cardDescription}>
                        {metric.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.sectionTitle}>Community Growth</h2>
              <p style={styles.sectionDescription}>
                New communities grouped by month, based on the data returned
                by your analytics API.
              </p>

              {analytics.communitiesOverTime?.length > 0 ? (
                analytics.communitiesOverTime.map((item, index) => {
                  const year = item._id?.year;
                  const month = item._id?.month;

                  const label =
                    year && month
                      ? new Date(year, month - 1).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" }
                        )
                      : "Date unavailable";

                  return (
                    <div
                      key={`${year || "year"}-${month || index}`}
                      style={styles.growthItem}
                    >
                      <span style={{ color: "#334155" }}>{label}</span>
                      <strong style={{ color: "#245da8" }}>
                        {Number(item.total || 0).toLocaleString()} new
                        {" "}communities
                      </strong>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#687386", margin: 0 }}>
                  No community growth data available yet.
                </p>
              )}
            </section>
          </>
        )}

        {!loading && !error && !analytics && (
          <div style={styles.message}>
            No analytics data was returned by the server.
          </div>
        )}

        <footer style={styles.footer}>
          Hometown Hub · Administration & Analytics
        </footer>
      </div>
    </main>
  );
}

export default AdminAnalytics;
