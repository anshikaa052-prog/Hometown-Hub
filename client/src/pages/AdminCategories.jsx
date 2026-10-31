
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/categories");
      const data = response.data;

      setCategories(
        Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
            ? data.categories
            : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: trimmedName,
        description: trimmedDescription,
      };

      if (editingId) {
        await API.put(
          `/admin/categories/${editingId}`,
          categoryData
        );
        setMessage("Category updated successfully.");
      } else {
        await API.post("/admin/categories", categoryData);
        setMessage("Category created successfully.");
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setName(category.name || "");
    setDescription(category.description || "");
    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (category) => {
    try {
      setUpdatingId(category._id);
      setError("");
      setMessage("");

      await API.put(`/admin/categories/${category._id}`, {
        isActive: !category.isActive,
      });

      setCategories((current) =>
        current.map((item) =>
          item._id === category._id
            ? { ...item, isActive: !category.isActive }
            : item
        )
      );

      setMessage(
        `Category ${category.isActive ? "deactivated" : "activated"} successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update category status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category._id);
      setError("");
      setMessage("");

      await API.delete(`/admin/categories/${category._id}`);

      setCategories((current) =>
        current.filter((item) => item._id !== category._id)
      );

      if (editingId === category._id) {
        resetForm();
      }

      setMessage("Category deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete category. Please try again."
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch = [
        category.name,
        category.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCount = categories.length - activeCount;

  const buttonBase = {
    border: "none",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "clamp(16px, 4vw, 36px)",
        boxSizing: "border-box",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                color: "#4f46e5",
                fontWeight: "700",
                fontSize: "12px",
                letterSpacing: "1.5px",
                margin: "0 0 8px",
              }}
            >
              HOMETOWN HUB · ADMINISTRATION
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 4vw, 34px)",
              }}
            >
              Category Management
            </h1>

            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Organize the topics used for community posts.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={{
                ...buttonBase,
                background: "#e8eaf0",
                color: "#334155",
              }}
            >
              ← Admin Dashboard
            </button>

            <button
              type="button"
              onClick={fetchCategories}
              disabled={loading || Boolean(saving)}
              style={{
                ...buttonBase,
                background: "#4f46e5",
                color: "#fff",
                opacity: loading || saving ? 0.6 : 1,
              }}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              padding: "13px 16px",
              borderRadius: "10px",
              background: "#fef2f2",
              color: "#b91c1c",
              marginBottom: "18px",
            }}
          >
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              style={{
                float: "right",
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              padding: "13px 16px",
              borderRadius: "10px",
              background: "#ecfdf5",
              color: "#047857",
              marginBottom: "18px",
            }}
          >
            {message}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Total Categories",
              value: categories.length,
              color: "#4f46e5",
            },
            {
              label: "Active Categories",
              value: activeCount,
              color: "#047857",
            },
            {
              label: "Inactive Categories",
              value: inactiveCount,
              color: "#c2410c",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#fff",
                border: "1px solid #e8ecf3",
                borderRadius: "15px",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
              }}
            >
              <p
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                  margin: "0 0 10px",
                }}
              >
                {item.label}
              </p>

              <strong style={{ fontSize: "30px", color: item.color }}>
                {item.value}
              </strong>
            </div>
          ))}
        </section>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            border: "1px solid #e8ecf3",
            borderRadius: "16px",
            padding: "clamp(18px, 3vw, 26px)",
            marginBottom: "24px",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ marginBottom: "22px" }}>
            <h2 style={{ margin: "0 0 7px", fontSize: "21px" }}>
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              {editingId
                ? "Update the category details below."
                : "Create a category for organizing community posts."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label
                htmlFor="categoryName"
                style={{
                  display: "block",
                  fontWeight: "600",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                Category Name *
              </label>

              <input
                id="categoryName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Local News"
                maxLength={80}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #dbe1ea",
                  borderRadius: "9px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="categoryDescription"
                style={{
                  display: "block",
                  fontWeight: "600",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                Description
              </label>

              <textarea
                id="categoryDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter a short description"
                maxLength={300}
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #dbe1ea",
                  borderRadius: "9px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <p
            style={{
              color: "#94a3b8",
              textAlign: "right",
              fontSize: "11px",
              margin: "6px 0 0",
            }}
          >
            {description.length}/300 characters
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "18px",
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                ...buttonBase,
                background: "#4f46e5",
                color: "#fff",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "+ Add Category"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  ...buttonBase,
                  background: "#eef2f7",
                  color: "#334155",
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 5px", fontSize: "21px" }}>
                Existing Categories
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                {filteredCategories.length} of {categories.length} categories
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <input
              type="search"
              aria-label="Search categories"
              placeholder="Search by name or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #dbe1ea",
                borderRadius: "9px",
                background: "#fff",
                fontSize: "14px",
              }}
            />

            <select
              aria-label="Filter categories by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #dbe1ea",
                borderRadius: "9px",
                background: "#fff",
                fontSize: "14px",
              }}
            >
              <option value="all">All categories</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          {loading ? (
            <div
              style={{
                background: "#fff",
                borderRadius: "15px",
                padding: "40px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8ecf3",
                borderRadius: "15px",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "34px", marginBottom: "12px" }}>
                🗂️
              </div>

              <h3 style={{ margin: "0 0 8px" }}>
                {categories.length === 0
                  ? "No categories yet"
                  : "No matching categories"}
              </h3>

              <p style={{ color: "#64748b", margin: 0 }}>
                {categories.length === 0
                  ? "Add your first category using the form above."
                  : "Try another search term or status filter."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {filteredCategories.map((category) => {
                const isUpdating = updatingId === category._id;
                const isDeleting = deletingId === category._id;

                return (
                  <article
                    key={category._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "18px",
                      background: "#fff",
                      border: "1px solid #e8ecf3",
                      borderRadius: "15px",
                      padding: "clamp(16px, 3vw, 22px)",
                      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.025)",
                    }}
                  >
                    <div style={{ flex: "1 1 250px", minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "17px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {category.name}
                        </h3>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: category.isActive
                              ? "#ecfdf5"
                              : "#f1f5f9",
                            color: category.isActive
                              ? "#047857"
                              : "#64748b",
                          }}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: "14px",
                          lineHeight: 1.6,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {category.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        disabled={Boolean(updatingId) || Boolean(deletingId) || saving}
                        style={{
                          ...buttonBase,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(category)}
                        disabled={Boolean(updatingId) || Boolean(deletingId) || saving}
                        style={{
                          ...buttonBase,
                          background: "#fef3c7",
                          color: "#92400e",
                          opacity: isUpdating ? 0.6 : 1,
                        }}
                      >
                        {isUpdating
                          ? "Updating..."
                          : category.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={Boolean(updatingId) || Boolean(deletingId) || saving}
                        style={{
                          ...buttonBase,
                          background: "#fee2e2",
                          color: "#b91c1c",
                          opacity: isDeleting ? 0.6 : 1,
                        }}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
            marginTop: "32px",
          }}
        >
          Hometown Hub · Admin Category Management
        </footer>
      </div>
    </div>
  );
}

export default AdminCategories;
