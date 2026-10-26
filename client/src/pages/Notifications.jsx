import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to load notifications"
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
        ...current.filter((item) => item._id !== notification._id),
      ]);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      <h1>Notifications 🔔</h1>
      <p>Unread notifications: {unreadCount}</p>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            style={{
              padding: "15px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: notification.isRead ? "#fff" : "#eef6ff",
            }}
          >
            <p>{notification.message}</p>

            <small>
              {new Date(notification.createdAt).toLocaleString()}
            </small>

            {!notification.isRead && (
              <div>
                <button
                  onClick={() => markAsRead(notification._id)}
                  style={{ marginTop: "10px" }}
                >
                  Mark as Read
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;