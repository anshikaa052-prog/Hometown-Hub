
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const getProtectedData = async () => {
      try {
        const response = await API.get("/test/protected");

        if (active) {
          setMessage(response.data.message || "Welcome to Hometown Hub!");
          setRole(response.data.user?.role || "");
        }
      } catch (error) {
        if (active) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    getProtectedData();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await API.post("/auth/logout");
      localStorage.removeItem("userId");
      alert(response.data?.message || "Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Logout failed. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const dashboardItems = [
    {
      icon: "👤",
      title: "My Profile",
      description: "Manage your personal information and profile.",
      button: "View Profile",
      path: "/profile",
      color: "purple",
    },
    {
      icon: "🏡",
      title: "Communities",
      description: "Discover communities and connect with people.",
      button: "Explore Communities",
      path: "/communities",
      color: "blue",
    },
    {
      icon: "🔔",
      title: "Notifications",
      description: "Stay updated with your community activities.",
      button: "View Notifications",
      path: "/notifications",
      color: "orange",
    },
    {
      icon: "📅",
      title: "Events",
      description: "Explore events and stay connected locally.",
      button: "Explore Events",
      path: "/events",
      color: "green",
    },
  ];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <button
          type="button"
          className="dashboard-brand"
          onClick={() => navigate("/dashboard")}
        >
          <span className="dashboard-brand-icon">⌂</span>
          <span>Hometown <strong>Hub</strong></span>
        </button>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-header-link"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div className="dashboard-welcome-content">
            <span className="dashboard-label">YOUR COMMUNITY SPACE</span>

            <h1>
              Welcome to your
              <br />
              <span>Hometown Hub!</span>
            </h1>

            <p>
              Stay connected to your roots, discover your community,
              and make every connection count.
            </p>

            {loading ? (
              <p className="dashboard-status">Loading your dashboard...</p>
            ) : (
              message && (
                <p className="dashboard-status">{message}</p>
              )
            )}

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() => navigate("/communities")}
            >
              Explore Communities <span>→</span>
            </button>
          </div>

          <div className="dashboard-welcome-art" aria-hidden="true">
            <div className="dashboard-art-circle">
              <span className="dashboard-art-house">⌂</span>
              <span className="dashboard-art-heart">♥</span>
            </div>
            <span className="dashboard-art-dot dot-one" />
            <span className="dashboard-art-dot dot-two" />
            <span className="dashboard-art-dot dot-three" />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-label">GET STARTED</span>
              <h2>Your Quick Links</h2>
              <p>Everything you need, all in one place.</p>
            </div>
          </div>

          <div className="dashboard-grid">
            {dashboardItems.map((item) => (
              <article
                className="dashboard-card"
                key={item.title}
              >
                <div
                  className={`dashboard-card-icon ${item.color}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <button
                  type="button"
                  className="dashboard-card-button"
                  onClick={() => navigate(item.path)}
                >
                  {item.button} <span>→</span>
                </button>
              </article>
            ))}

            {role === "admin" && (
              <article className="dashboard-card admin-card">
                <div className="dashboard-card-icon purple" aria-hidden="true">
                  🛡️
                </div>

                <h3>Admin Dashboard</h3>
                <p>
                  Manage users, review reports, and oversee your platform.
                </p>

                <button
                  type="button"
                  className="dashboard-card-button"
                  onClick={() => navigate("/admin")}
                >
                  Open Admin Panel <span>→</span>
                </button>
              </article>
            )}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>Hometown Hub</span>
          <span>Closer to home, wherever you are. 💜</span>
        </footer>
      </div>
    </main>
  );
}

export default Dashboard;
