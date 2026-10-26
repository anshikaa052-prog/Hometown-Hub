import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getProtectedData = async () => {
      try {
        const response = await API.get("/test/protected");
        setMessage(response.data.message);
      } catch (error) {
        navigate("/login");
      }
    };

    getProtectedData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await API.post("/auth/logout");

      localStorage.removeItem("userId");
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard</h1>
      <p>{message}</p>

      <button onClick={() => navigate("/profile")}>
        Profile
      </button>{" "}

      <button onClick={() => navigate("/communities")}>
        Communities
      </button>{" "}

      <button onClick={() => navigate("/notifications")}>
        Notifications
      </button>{" "}

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;