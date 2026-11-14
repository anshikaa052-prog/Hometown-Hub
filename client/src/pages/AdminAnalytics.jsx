
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
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
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = [
    {
      title: "Total Users",
      key: "totalUsers",
      icon: "👥",
      color: "#245da8",
      background: "#e8f0ff",
    },
    {
      title: "Total Communities",
      key: "totalCommunities",
      icon: "🏘️",
      color: "#7542b8",
      background: "#f1e8ff",
    },
    {
      title: "Pending Approvals",
      key: "pendingCommunities",
      icon: "⏳",
      color: "#b76b08",
      background: "#fff3db",
    },
    {
      title: "Open Reports",
      key: "pendingReports",
      icon: "🚩",
      color: "#c24141",
      background: "#feecec",
    },
  ];

  const adminSections = [
    {
      icon: "🏘️",
      title: "Community Approvals",
      description:
        "Review community requests and manage approval decisions.",
      button: "Manage Approvals",
      path: "/admin/communities",
      color: "blue",
    },
    {
      icon: "👥",
      title: "User Management",
      description:
        "Manage registered users and maintain a safe community.",
      button: "Manage Users",
      path: "/admin/users",
      color: "purple",
    },
    {
      icon: "🚩",
      title: "Abuse Reports",
      description:
        "Review reported content and handle moderation issues.",
      button: "Manage Reports",
      path: "/admin/reports",
      color: "red",
    },
    {
      icon: "📊",
      title: "Analytics",
      description:
        "Explore platform statistics and community activity.",
      button: "View Analytics",
      path: "/admin/analytics",
      color: "green",
    },
    {
      icon: "🏷️",
      title: "Category Management",
      description:
        "Add, edit, activate, or deactivate content categories.",
      button: "Manage Categories",
      path: "/admin/categories",
      color: "orange",
    },
  ];

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-brand">
          <span className="admin-brand-icon">H</span>
          <span>Hometown Hub</span>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <section className="admin-dashboard-hero">
        <div className="admin-hero-label">
          <span className="admin-status-dot" />
          ADMIN CONTROL PANEL
        </div>

        <h1>Admin Dashboard</h1>

        <p>
          Welcome to the Hometown Hub Admin Panel. Manage users,
          communities, reports, and platform settings from one place.
        </p>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto 35px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 6px", color: "#173b72" }}>
              Platform Overview
            </h2>
            <p style={{ margin: 0, color: "#687386", fontSize: "14px" }}>
              Important platform statistics at a glance.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              padding: "10px 15px",
              border: "1px solid #d8e0ed",
              borderRadius: "8px",
              background: "#fff",
              color: "#24446f",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {loading && (
          <p role="status" style={{ color: "#687386" }}>
            Loading platform statistics...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#fef2f2",
              color: "#991b1b",
            }}
          >
            <p>{error}</p>
            <button type="button" onClick={fetchAnalytics}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && analytics && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "18px",
            }}
          >
            {stats.map((stat) => {
              const value = analytics[stat.key];

              return (
                <article
                  key={stat.key}
                  style={{
                    padding: "22px",
                    border: "1px solid #e3eaf4",
                    borderRadius: "14px",
                    background: "#fff",
                    boxShadow: "0 4px 14px rgba(20,45,85,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "18px",
                    }}
                  >
                    <span style={{ color: "#687386", fontSize: "14px" }}>
                      {stat.title}
                    </span>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "42px",
                        height: "42px",
                        borderRadius: "11px",
                        background: stat.background,
                        fontSize: "21px",
                      }}
                    >
                      {stat.icon}
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: stat.color,
                      fontSize: "30px",
                    }}
                  >
                    {value === null || value === undefined
                      ? "—"
                      : Number(value).toLocaleString()}
                  </h2>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && !analytics && (
          <p style={{ color: "#687386" }}>
            No statistics available.
          </p>
        )}
      </section>

      <section className="admin-dashboard-content">
        <div className="admin-section-heading">
          <div>
            <h2>Platform Management</h2>
            <p>Select a section to manage your platform.</p>
          </div>

          <span className="admin-section-count">
            {adminSections.length} Sections
          </span>
        </div>

        <div className="admin-dashboard-grid">
          {adminSections.map((section) => (
            <article
              className="admin-dashboard-card"
              key={section.path}
            >
              <div
                className={`admin-card-icon admin-icon-${section.color}`}
                aria-hidden="true"
              >
                {section.icon}
              </div>

              <h3>{section.title}</h3>

              <p>{section.description}</p>

              <button
                type="button"
                className="admin-card-button"
                onClick={() => navigate(section.path)}
              >
                {section.button}
                <span aria-hidden="true"> →</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="admin-dashboard-footer">
        Hometown Hub · Administration Panel
      </footer>
    </main>
  );
}

export default AdminDashboard;
