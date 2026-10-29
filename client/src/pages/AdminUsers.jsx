import { useEffect, useState } from "react";
import API from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");
      const fetchedUsers = response.data.users || [];

      setUsers(fetchedUsers);

      setSelectedRoles(
        Object.fromEntries(
          fetchedUsers.map((user) => [user._id, user.role])
        )
      );
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

  const updateRole = async (user) => {
    const newRole = selectedRoles[user._id];

    if (!["user", "moderator"].includes(newRole)) {
      setError("Please select a valid role.");
      return;
    }

    if (newRole === user.role) {
      return;
    }

    try {
      setUpdatingUserId(user._id);
      setError("");

      const response = await API.put(
        `/admin/users/${user._id}/role`,
        { role: newRole }
      );

      const updatedRole = response.data.user?.role || newRole;

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id
            ? { ...item, role: updatedRole }
            : item
        )
      );

      setSelectedRoles((currentRoles) => ({
        ...currentRoles,
        [user._id]: updatedRole,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update user role"
      );

      setSelectedRoles((currentRoles) => ({
        ...currentRoles,
        [user._id]: user.role,
      }));
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
      <p>Manage registered Hometown Hub users and their roles.</p>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <button onClick={fetchUsers} disabled={Boolean(updatingUserId)}>
        Refresh Users
      </button>

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
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ padding: "10px" }}>{user.name}</td>
                  <td style={{ padding: "10px" }}>{user.email}</td>

                  <td style={{ padding: "10px" }}>
                    {user.role === "admin" ? (
                      <span>Admin</span>
                    ) : (
                      <div>
                        <select
                          value={selectedRoles[user._id] || user.role}
                          onChange={(event) =>
                            setSelectedRoles((currentRoles) => ({
                              ...currentRoles,
                              [user._id]: event.target.value,
                            }))
                          }
                          disabled={updatingUserId === user._id}
                          aria-label={`Role for ${user.name}`}
                        >
                          <option value="user">Regular User</option>
                          <option value="moderator">Moderator</option>
                        </select>

                        <button
                          onClick={() => updateRole(user)}
                          disabled={
                            updatingUserId === user._id ||
                            selectedRoles[user._id] === user.role
                          }
                          style={{ marginLeft: "8px" }}
                        >
                          {updatingUserId === user._id
                            ? "Updating..."
                            : "Save Role"}
                        </button>
                      </div>
                    )}
                  </td>

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
