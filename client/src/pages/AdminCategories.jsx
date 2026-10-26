
import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/categories");
      setCategories(response.data.categories || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: name.trim(),
        description: description.trim(),
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
      setMessage(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleToggleStatus = async (category) => {
    setError("");
    setMessage("");

    try {
      await API.put(`/admin/categories/${category._id}`, {
        isActive: !category.isActive,
      });

      setMessage(
        `Category ${
          category.isActive ? "deactivated" : "activated"
        } successfully.`
      );

      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update category status."
      );
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await API.delete(`/admin/categories/${category._id}`);

      if (editingId === category._id) {
        setName("");
        setDescription("");
        setEditingId(null);
      }

      setMessage("Category deleted successfully.");
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete category. Please try again."
      );
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Category Management</h1>
          <p style={styles.subtitle}>
            Create and manage content categories for Hometown Hub.
          </p>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/admin")}
        >
          Back to Admin Dashboard
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.sectionHeading}>
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>

        <label style={styles.label} htmlFor="categoryName">
          Category Name
        </label>

        <input
          id="categoryName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Local News"
          maxLength={80}
          required
          style={styles.input}
        />

        <label style={styles.label} htmlFor="categoryDescription">
          Description
        </label>

        <textarea
          id="categoryDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a short description"
          maxLength={300}
          rows={3}
          style={styles.input}
        />

        <div style={styles.formActions}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.primaryButton,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Category"
                : "Add Category"}
          </button>

          {editingId && (
            <button
              type="button"
              style={styles.cancelButton}
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <section style={styles.listSection}>
        <h2 style={styles.sectionHeading}>
          Existing Categories ({categories.length})
        </h2>

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p style={styles.empty}>
            No categories found. Add your first category above.
          </p>
        ) : (
          <div style={styles.categoryList}>
            {categories.map((category) => (
              <div key={category._id} style={styles.categoryCard}>
                <div style={styles.categoryInfo}>
                  <h3 style={styles.categoryName}>
                    {category.name}
                  </h3>

                  <p style={styles.description}>
                    {category.description ||
                      "No description provided."}
                  </p>

                  <span
                    style={{
                      ...styles.status,
                      ...(category.isActive
                        ? styles.active
                        : styles.inactive),
                    }}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.editButton}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={styles.statusButton}
                    onClick={() => handleToggleStatus(category)}
                  >
                    {category.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1000px",
    margin: "35px auto",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "25px",
  },
  heading: {
    margin: "0 0 8px",
    fontSize: "30px",
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
  },
  backButton: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },
  form: {
    padding: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fff",
    marginBottom: "30px",
  },
  sectionHeading: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "21px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "11px",
    marginBottom: "18px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "11px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "11px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },
  listSection: {
    marginTop: "25px",
  },
  empty: {
    padding: "20px",
    background: "#fff",
    borderRadius: "8px",
  },
  categoryList: {
    display: "grid",
    gap: "14px",
  },
  categoryCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fff",
  },
  categoryInfo: {
    flex: "1 1 250px",
  },
  categoryName: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  description: {
    margin: "0 0 12px",
    color: "#6b7280",
  },
  status: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  active: {
    background: "#dcfce7",
    color: "#166534",
  },
  inactive: {
    background: "#f3f4f6",
    color: "#4b5563",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  editButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    background: "#dbeafe",
    color: "#1d4ed8",
    cursor: "pointer",
  },
  statusButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    background: "#fef3c7",
    color: "#92400e",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
  },
  error: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    background: "#fee2e2",
    color: "#991b1b",
  },
  success: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    background: "#dcfce7",
    color: "#166534",
  },
};

export default AdminCategories;
