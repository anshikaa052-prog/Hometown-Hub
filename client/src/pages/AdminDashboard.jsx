
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Hometown Hub Admin Panel.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h3>Community Approvals</h3>
          <p>Review community requests.</p>
          <button
            type="button"
            onClick={() => navigate("/admin/communities")}
          >
            Manage Community Approvals
          </button>
        </div>

        <div style={cardStyle}>
          <h3>User Management</h3>
          <p>Manage registered users.</p>
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Abuse Reports</h3>
          <p>Review reports and moderation issues.</p>
          <button
            type="button"
            onClick={() => navigate("/admin/reports")}
          >
            Manage Abuse Reports
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Analytics</h3>
          <p>View platform statistics.</p>
          <button
            type="button"
            onClick={() => navigate("/admin/analytics")}
          >
            View Analytics
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Category Management</h3>
          <p>Add, edit, activate, or deactivate content categories.</p>
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
          >
            Manage Categories
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          padding: "10px 16px",
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "20px",
  background: "#fff",
};

export default AdminDashboard;
