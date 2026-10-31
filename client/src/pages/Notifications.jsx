
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setError("");
      const response = await API.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (notification) => {
      setNotifications((current) => [
        notification,
        ...current.filter(
          (item) => item._id !== notification._id
        ),
      ]);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);
      setError("");

      await API.patch(`/notifications/${notificationId}/read`);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark notification as read."
      );
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <main className="notifications-page">
      <header className="notifications-header">
        <div className="notifications-header-content">
          <p className="notifications-brand">Hometown Hub</p>
          <h1>
            Notifications <span aria-hidden="true">🔔</span>
          </h1>
          <p className="notifications-subtitle">
            Stay updated with what's happening in your community.
          </p>
        </div>

        <button
          type="button"
          className="notifications-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <section className="notifications-content">
        <div className="notifications-summary">
          <div>
            <h2>Your Notifications</h2>
            <p>Important updates from your community.</p>
          </div>

          <div className="notifications-unread-badge">
            <span className="notifications-unread-number">
              {unreadCount}
            </span>
            <span>Unread</span>
          </div>
        </div>

        {error && (
          <div className="notifications-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="notifications-empty-state">
            <div className="notifications-loading-icon">🔔</div>
            <h3>Loading notifications...</h3>
            <p>Please wait a moment.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty-state">
            <div className="notifications-empty-icon">🔕</div>
            <h3>You're all caught up!</h3>
            <p>
              You don't have any notifications yet. New updates will
              appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`notification-card ${
                  notification.isRead
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >
                <div className="notification-icon" aria-hidden="true">
                  {notification.isRead ? "✓" : "🔔"}
                </div>

                <div className="notification-details">
                  <div className="notification-title-row">
                    <h3>
                      {notification.isRead
                        ? "Notification"
                        : "New Update"}
                    </h3>

                    {!notification.isRead && (
                      <span className="notification-new-label">
                        New
                      </span>
                    )}
                  </div>

                  <p className="notification-message">
                    {notification.message}
                  </p>

                  <time className="notification-date">
                    {formatDate(notification.createdAt)}
                  </time>
                </div>

                {!notification.isRead && (
                  <button
                    type="button"
                    className="notification-read-button"
                    onClick={() => markAsRead(notification._id)}
                    disabled={markingId === notification._id}
                  >
                    {markingId === notification._id
                      ? "Saving..."
                      : "Mark as Read"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="notifications-footer">
        Hometown Hub — Stay connected to your roots.
      </footer>
    </main>
  );
}

export default Notifications;
