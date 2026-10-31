
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
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
        err.response?.data?.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.isBlocked) ||
        (statusFilter === "blocked" && user.isBlocked);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const activeCount = users.filter((user) => !user.isBlocked).length;
  const blockedCount = users.filter((user) => user.isBlocked).length;

  const toggleBlock = async (user) => {
    if (user.role === "admin") {
      setError("Admin accounts are protected.");
      return;
    }

    const action = user.isBlocked ? "unblock" : "block";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${user.name || "this user"}?`
      )
    ) {
      return;
    }

    try {
      setUpdatingUserId(user._id);
      setError("");
      setSuccess("");

      await API.put(`/admin/users/${user._id}/${action}`);

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id
            ? { ...item, isBlocked: !item.isBlocked }
            : item
        )
      );

      setSuccess(
        `${user.name || "User"} has been ${
          action === "block" ? "blocked" : "unblocked"
        } successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update user status."
      );
    } finally {
      setUpdatingUserId("");
    }
  };

  const updateRole = async (user) => {
    const newRole = selectedRoles[user._id];

    if (user.role === "admin") {
      setError("Admin roles are protected.");
      return;
    }

    if (!["user", "moderator"].includes(newRole)) {
      setError("Please select a valid role.");
      return;
    }

    if (newRole === user.role) return;

    try {
      setUpdatingUserId(user._id);
      setError("");
      setSuccess("");

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

      setSuccess(`Role updated successfully for ${user.name || "user"}.`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update user role."
      );

      setSelectedRoles((currentRoles) => ({
        ...currentRoles,
        [user._id]: user.role,
      }));
    } finally {
      setUpdatingUserId("");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      boxSizing: "border-box",
      padding: "28px 20px 48px",
      background: "#f4f7fc",
      color: "#1f2937",
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "28px",
    },
    eyebrow: {
      marginBottom: "9px",
      color: "#2862a8",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "1.5px",
    },
    title: {
      margin: "0 0 9px",
      color: "#173b72",
      fontSize: "clamp(26px, 4vw, 34px)",
    },
    subtitle: {
      margin: 0,
      color: "#687386",
      lineHeight: 1.7,
    },
    button: {
      padding: "11px 15px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      background: "#fff",
      color: "#24446f",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "25px",
    },
    statCard: {
      padding: "21px",
      background: "#fff",
      border: "1px solid #e3eaf4",
      borderRadius: "14px",
      boxShadow: "0 4px 14px rgba(20,45,85,0.04)",
    },
    statLabel: {
      marginBottom: "10px",
      color: "#687386",
      fontSize: "14px",
    },
    statNumber: {
      color: "#173b72",
      fontSize: "30px",
      fontWeight: 700,
    },
    panel: {
      overflow: "hidden",
      background: "#fff",
      border: "1px solid #e3eaf4",
      borderRadius: "14px",
      boxShadow: "0 4px 14px rgba(20,45,85,0.04)",
    },
    toolbar: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      padding: "20px",
      borderBottom: "1px solid #e8edf5",
    },
    input: {
      flex: "1 1 240px",
      minWidth: 0,
      padding: "12px 14px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    select: {
      maxWidth: "100%",
      padding: "10px 12px",
      border: "1px solid #d8e0ed",
      borderRadius: "8px",
      background: "#fff",
      color: "#334155",
      fontSize: "14px",
    },
    message: {
      margin: "16px 20px 0",
      padding: "12px 14px",
      borderRadius: "8px",
      fontSize: "14px",
      lineHeight: 1.6,
    },
    tableWrap: {
      width: "100%",
      overflowX: "auto",
    },
    table: {
      width: "100%",
      minWidth: "800px",
      borderCollapse: "collapse",
      textAlign: "left",
    },
    th: {
      padding: "15px 18px",
      background: "#f8faff",
      color: "#617087",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "17px 18px",
      borderTop: "1px solid #edf1f7",
      verticalAlign: "middle",
      fontSize: "14px",
    },
    name: {
      marginBottom: "5px",
      color: "#173b72",
      fontWeight: 700,
    },
    email: {
      color: "#718096",
      fontSize: "13px",
      overflowWrap: "anywhere",
    },
    badge: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    },
    actionButton: {
      padding: "9px 11px",
      border: "none",
      borderRadius: "7px",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    empty: {
      padding: "40px 20px",
      color: "#687386",
      textAlign: "center",
      lineHeight: 1.7,
    },
    footer: {
      padding: "17px 20px",
      borderTop: "1px solid #e8edf5",
      color: "#718096",
      fontSize: "13px",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              HOMETOWN HUB / ADMINISTRATION
            </div>
            <h1 style={styles.title}>User Management</h1>
            <p style={styles.subtitle}>
              Manage registered members, account status, and user roles.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              style={styles.button}
              onClick={() => navigate("/admin")}
            >
              ← Admin Dashboard
            </button>

            <button
              type="button"
              style={{
                ...styles.button,
                opacity: loading ? 0.65 : 1,
              }}
              onClick={fetchUsers}
              disabled={loading || Boolean(updatingUserId)}
            >
              {loading ? "Refreshing..." : "↻ Refresh Users"}
            </button>
          </div>
        </header>

        <section style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Users</div>
            <div style={styles.statNumber}>{users.length}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Accounts</div>
            <div style={styles.statNumber}>{activeCount}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Blocked Accounts</div>
            <div style={styles.statNumber}>{blockedCount}</div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.toolbar}>
            <input
              type="search"
              aria-label="Search users"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.input}
            />

            <select
              aria-label="Filter users by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.select}
            >
              <option value="all">All accounts</option>
              <option value="active">Active accounts</option>
              <option value="blocked">Blocked accounts</option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                ...styles.message,
                color: "#991b1b",
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                ...styles.message,
                color: "#166534",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              {success}
            </div>
          )}

          {loading ? (
            <div style={styles.empty}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={styles.empty}>
              No users found.
              <div>
                <button
                  type="button"
                  style={styles.button}
                  onClick={fetchUsers}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.empty}>
              No users match your search or selected filter.
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isBusy = updatingUserId === user._id;
                    const isAdmin = user.role === "admin";
                    const roleChanged =
                      selectedRoles[user._id] !== user.role;

                    return (
                      <tr key={user._id}>
                        <td style={styles.td}>
                          <div style={styles.name}>
                            {user.name || "Unnamed User"}
                          </div>
                          <div style={styles.email}>{user.email}</div>
                        </td>

                        <td style={styles.td}>
                          {isAdmin ? (
                            <span
                              style={{
                                ...styles.badge,
                                color: "#5b21b6",
                                background: "#ede9fe",
                              }}
                            >
                              Protected Admin
                            </span>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "8px",
                              }}
                            >
                              <select
                                aria-label={`Role for ${user.name || "user"}`}
                                style={styles.select}
                                value={
                                  selectedRoles[user._id] || user.role
                                }
                                disabled={isBusy}
                                onChange={(event) =>
                                  setSelectedRoles((currentRoles) => ({
                                    ...currentRoles,
                                    [user._id]: event.target.value,
                                  }))
                                }
                              >
                                <option value="user">Regular User</option>
                                <option value="moderator">Moderator</option>
                              </select>

                              {roleChanged && (
                                <button
                                  type="button"
                                  style={{
                                    ...styles.actionButton,
                                    background: "#245da8",
                                    color: "#fff",
                                    opacity: isBusy ? 0.6 : 1,
                                  }}
                                  disabled={isBusy}
                                  onClick={() => updateRole(user)}
                                >
                                  {isBusy ? "Updating..." : "Save Role"}
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              color: user.isBlocked ? "#991b1b" : "#166534",
                              background: user.isBlocked
                                ? "#fee2e2"
                                : "#dcfce7",
                            }}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {isAdmin ? (
                            <span style={{ color: "#718096" }}>
                              Protected account
                            </span>
                          ) : (
                            <button
                              type="button"
                              style={{
                                ...styles.actionButton,
                                background: user.isBlocked
                                  ? "#dcfce7"
                                  : "#fee2e2",
                                color: user.isBlocked
                                  ? "#166534"
                                  : "#991b1b",
                                opacity: isBusy ? 0.6 : 1,
                              }}
                              disabled={isBusy}
                              onClick={() => toggleBlock(user)}
                            >
                              {isBusy
                                ? "Updating..."
                                : user.isBlocked
                                  ? "Unblock User"
                                  : "Block User"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div style={styles.footer}>
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminUsers;
