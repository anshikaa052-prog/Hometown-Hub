
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const getDashboardData = async () => {
      try {
        const userResponse = await API.get("/test/protected");
        const user = userResponse.data.user || userResponse.data;
        const userId = user.userId || user._id || user.id;

        if (!active) return;

        setRole(user.role || "");

        const communitiesResponse = await API.get("/communities");
        const allCommunities = communitiesResponse.data.communities || [];

        const joinedCommunities = allCommunities.filter((community) =>
          (community.members || []).some((member) => {
            const memberId = member?._id || member;
            return String(memberId) === String(userId);
          })
        );

        if (!active) return;

        setCommunities(joinedCommunities);

        const eventResults = await Promise.allSettled(
          joinedCommunities.map((community) =>
            API.get(`/events/community/${community._id}`)
          )
        );

        if (!active) return;

        const allEvents = eventResults.flatMap((result) =>
          result.status === "fulfilled"
            ? result.value.data.events || []
            : []
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filteredEvents = allEvents
          .filter((event) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort((a, b) => {
            const dateA = new Date(
              `${String(a.date).slice(0, 10)}T${a.time || "00:00"}`
            );
            const dateB = new Date(
              `${String(b.date).slice(0, 10)}T${b.time || "00:00"}`
            );

            return dateA - dateB;
          })
          .slice(0, 3);

        setUpcomingEvents(filteredEvents);
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

    getDashboardData();

    return () => {
      active = false;
    };
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const [year, month, day] = String(date).slice(0, 10).split("-");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

            {loading && (
              <p className="dashboard-status">
                Loading your dashboard...
              </p>
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
              <article className="dashboard-card" key={item.title}>
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

        {/* Your Communities */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-label">YOUR CONNECTIONS</span>
              <h2>Your Communities</h2>
              <p>Communities you have joined.</p>
            </div>
          </div>

          {loading ? (
            <p className="dashboard-empty">Loading your communities...</p>
          ) : communities.length === 0 ? (
            <div className="dashboard-card">
              <h3>No communities joined yet</h3>
              <p>Explore communities and join one to get started.</p>
              <button
                type="button"
                className="dashboard-card-button"
                onClick={() => navigate("/communities")}
              >
                Explore Communities →
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {communities.slice(0, 4).map((community) => (
                <article className="dashboard-card" key={community._id}>
                  <div className="dashboard-card-icon blue">🏡</div>

                  <h3>{community.name}</h3>

                  <p>
                    {community.city || "Local Community"}
                    <br />
                    {community.members?.length || 0} Members
                  </p>

                  <button
                    type="button"
                    className="dashboard-card-button"
                    onClick={() =>
                      navigate(`/communities/${community._id}`)
                    }
                  >
                    View Community →
                  </button>
                </article>
              ))}
            </div>
          )}

          {communities.length > 4 && (
            <button
              type="button"
              className="dashboard-card-button"
              onClick={() => navigate("/communities")}
              style={{ marginTop: "18px" }}
            >
              View All Communities →
            </button>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-label">WHAT'S HAPPENING</span>
              <h2>Upcoming Events</h2>
              <p>Don't miss what's happening in your communities.</p>
            </div>
          </div>

          {loading ? (
            <p className="dashboard-empty">Loading upcoming events...</p>
          ) : upcomingEvents.length === 0 ? (
            <div className="dashboard-card">
              <h3>No upcoming events</h3>
              <p>There are no upcoming events in your communities right now.</p>
              <button
                type="button"
                className="dashboard-card-button"
                onClick={() => navigate("/events")}
              >
                Explore Events →
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {upcomingEvents.map((event) => (
                <article className="dashboard-card" key={event._id}>
                  <div className="dashboard-card-icon green">📅</div>

                  <h3>{event.title}</h3>

                  <p>
                    <strong>Date:</strong> {formatDate(event.date)}
                    <br />
                    <strong>Time:</strong> {event.time || "Not specified"}
                    <br />
                    <strong>Location:</strong>{" "}
                    {event.location || "Not specified"}
                  </p>

                  <button
                    type="button"
                    className="dashboard-card-button"
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    View Event →
                  </button>
                </article>
              ))}
            </div>
          )}
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
