
import { useEffect, useState } from "react";
import API from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";

    try {
      setUpdatingUserId(user._id);
      setError("");

      await API.put(`/admin/users/${user._id}/${action}`);

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id
            ? { ...item, isBlocked: !item.isBlocked }
            : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update user"
      );
    } finally {
      setUpdatingUserId("");
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>User Management</h1>
      <p>Manage registered Hometown Hub users.</p>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <button onClick={fetchUsers}>Refresh Users</button>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Email</th>
                <th style={{ padding: "10px" }}>Role</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ padding: "10px" }}>{user.name}</td>
                  <td style={{ padding: "10px" }}>{user.email}</td>
                  <td style={{ padding: "10px" }}>{user.role}</td>
                  <td style={{ padding: "10px" }}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {user.role === "admin" ? (
                      <span>Protected admin</span>
                    ) : (
                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={updatingUserId === user._id}
                      >
                        {updatingUserId === user._id
                          ? "Updating..."
                          : user.isBlocked
                            ? "Unblock"
                            : "Block"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
