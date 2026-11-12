
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";
import "./Navbar.css";

function Navbar({ user }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await API.get("/notifications");
        const notifications = response.data.notifications || [];

        setUnreadCount(
          notifications.filter((item) => !item.isRead).length
        );
      } catch (error) {
        console.error("Failed to load unread notifications:", error);
      }
    };

    fetchUnreadCount();

    const handleNewNotification = () => {
      setUnreadCount((count) => count + 1);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const getLinkClass = ({ isActive }) =>
    `navbar-link ${isActive ? "active" : ""}`;

  return (
    <nav className="main-navbar">
      <NavLink to="/dashboard" className="navbar-logo" onClick={closeMenu}>
        Hometown Hub
      </NavLink>

      <button
        className="navbar-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <div className="navbar-links">
          <NavLink to="/dashboard" className={getLinkClass} onClick={closeMenu}>
            Dashboard
          </NavLink>

          <NavLink to="/communities" className={getLinkClass} onClick={closeMenu}>
            Communities
          </NavLink>

          <NavLink to="/events" className={getLinkClass} onClick={closeMenu}>
            Events
          </NavLink>

          <NavLink to="/notifications" className={getLinkClass} onClick={closeMenu}>
            Notifications
            {unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/profile" className={getLinkClass} onClick={closeMenu}>
            Profile
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" className={getLinkClass} onClick={closeMenu}>
              Admin
            </NavLink>
          )}
        </div>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
