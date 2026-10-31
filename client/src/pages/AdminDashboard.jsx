
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

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
