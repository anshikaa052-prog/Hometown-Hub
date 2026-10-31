import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const COMMUNITY_RULES = [
  "Be respectful and polite to all community members.",
  "Do not post abusive, hateful, or offensive content.",
  "Share only relevant and useful information.",
  "Do not spam or post misleading information.",
  "Respect the privacy of other community members.",
];

function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCommunity = useCallback(async () => {
    if (!communityId) {
      setError("Community ID is missing.");
      setCommunity(null);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await API.get(`/communities/${communityId}`);

      const data =
        response.data?.community ??
        response.data?.data?.community ??
        response.data?.data ??
        response.data;

      console.log("Community API response:", response.data);

      const normalizedCommunity = data
        ? {
            ...data,
            _id: data._id ?? data.id,
          }
        : null;

      console.log("Community data:", normalizedCommunity);

      if (!normalizedCommunity?._id) {
        setCommunity(null);
        setError("Community ID is missing from the API response.");
        return;
      }

      setCommunity(normalizedCommunity);
    } catch (err) {
      console.error("Fetch community error:", err);

      setCommunity(null);

      setError(
        err.response?.data?.message ||
          "Failed to load community. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    setLoading(true);
    fetchCommunity();
  }, [fetchCommunity]);

  const handleJoin = async () => {
    if (joining || !communityId) return;

    try {
      setJoining(true);
      setMessage("");
      setError("");

      const response = await API.post(
        `/communities/${communityId}/join`
      );

      setMessage(
        response.data?.message || "Community membership updated."
      );

      await fetchCommunity();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to join community. Please try again."
      );
    } finally {
      setJoining(false);
    }
  };

  const handleCoverImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("coverImage", file);

      const response = await API.post(
        `/communities/${communityId}/cover`,
        formData
      );

      setMessage(
        response.data?.message || "Cover image uploaded."
      );

      await fetchCommunity();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Community cover image upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main style={styles.center}>
        <p>Loading community...</p>
      </main>
    );
  }

  if (!community) {
    return (
      <main style={styles.container}>
        <p role="alert" style={styles.error}>
          {error || "Community not found."}
        </p>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => navigate("/communities")}
        >
          Back to Communities
        </button>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => {
            setLoading(true);
            fetchCommunity();
          }}
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <button
        type="button"
        style={styles.backButton}
        onClick={() => navigate("/communities")}
      >
        ← Back to Communities
      </button>

      <section style={styles.hero}>
        {community.coverImage ? (
          <img
            src={community.coverImage}
            alt={`${community.name || "Community"} cover`}
            style={styles.coverImage}
          />
        ) : (
          <div style={styles.coverPlaceholder}>
            <span style={styles.placeholderIcon}>🏘️</span>
            <p>Welcome to {community.name || "our community"}</p>
          </div>
        )}

        <div style={styles.heroContent}>
          <span style={styles.eyebrow}>
            HOMETOWN HUB COMMUNITY
          </span>

          <h1 style={styles.heading}>
            {community.name || "Community"}
          </h1>

          <p style={styles.location}>
            📍{" "}
            {[
              community.city,
              community.state,
              community.country,
            ]
              .filter(Boolean)
              .join(", ") || "Location not specified"}
          </p>

          <p style={styles.description}>
            {community.description ||
              "No description available yet."}
          </p>

          <div style={styles.stats}>
            <span>
              👥{" "}
              {community.memberCount ??
                community.members?.length ??
                0}{" "}
              members
            </span>

            {community.createdBy?.name && (
              <span>
                Created by {community.createdBy.name}
              </span>
            )}
          </div>
        </div>
      </section>

      {(error || message) && (
        <div
          role={error ? "alert" : "status"}
          style={error ? styles.error : styles.success}
        >
          {error || message}
        </div>
      )}

      <section style={styles.actionCard}>
        <h2 style={styles.sectionHeading}>
          Explore this community
        </h2>

        <p style={styles.muted}>
          Connect with members, share updates, and stay involved.
        </p>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? "Please wait..." : "Join Community"}
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() =>
              navigate(`/communities/${communityId}/feed`)
            }
          >
            📰 Open Community Feed
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() =>
              navigate(`/communities/${communityId}/chat`)
            }
          >
            💬 Open Community Chat
          </button>
        </div>
      </section>

      <section style={styles.actionCard}>
        <h2 style={styles.sectionHeading}>
          Community Cover Image
        </h2>

        <p style={styles.muted}>
          Select an image up to 5 MB.
        </p>

        <label style={styles.uploadLabel}>
          {uploading
            ? "Uploading image..."
            : "Choose Cover Image"}

          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImage}
            disabled={uploading}
            style={styles.fileInput}
          />
        </label>
      </section>

      <section style={styles.rulesCard}>
        <h2 style={styles.sectionHeading}>
          Community Rules & Guidelines
        </h2>

        <ul style={styles.rulesList}>
          {COMMUNITY_RULES.map((rule) => (
            <li key={rule} style={styles.rule}>
              <span style={styles.checkmark}>✓</span>
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Hometown Hub · Connecting
        communities
      </footer>
    </main>
  );
}

const styles = {
  container: {
    width: "min(100% - 32px, 1000px)",
    margin: "32px auto",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },

  center: {
    minHeight: "50vh",
    display: "grid",
    placeItems: "center",
    fontFamily: "Arial, sans-serif",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#3156a5",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "10px 0",
    marginBottom: "16px",
  },

  hero: {
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    background: "#fff",
    boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
  },

  coverImage: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    display: "block",
    background: "#eef2ff",
  },

  coverPlaceholder: {
    minHeight: "190px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e0e7ff, #dbeafe)",
    color: "#253b70",
  },

  placeholderIcon: {
    fontSize: "42px",
  },

  heroContent: {
    padding: "26px",
  },

  eyebrow: {
    color: "#4f46e5",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.4px",
  },

  heading: {
    margin: "10px 0",
    fontSize: "clamp(26px, 4vw, 36px)",
    overflowWrap: "anywhere",
  },

  location: {
    color: "#475569",
    margin: "8px 0",
  },

  description: {
    color: "#475569",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px 22px",
    marginTop: "20px",
    color: "#334155",
    fontSize: "14px",
  },

  actionCard: {
    marginTop: "22px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#fff",
  },

  sectionHeading: {
    margin: "0 0 10px",
    fontSize: "21px",
  },

  muted: {
    color: "#64748b",
    lineHeight: 1.6,
  },

  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "9px",
    background: "#3156a5",
    color: "#fff",
    padding: "12px 18px",
    fontWeight: 600,
    cursor: "pointer",
    marginRight: "8px",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#fff",
    color: "#263653",
    padding: "12px 16px",
    fontWeight: 600,
    cursor: "pointer",
    marginRight: "8px",
  },

  uploadLabel: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
    color: "#3156a5",
    fontWeight: 600,
    cursor: "pointer",
  },

  fileInput: {
    maxWidth: "100%",
    color: "#475569",
    fontWeight: 400,
  },

  rulesCard: {
    marginTop: "22px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#f8fafc",
  },

  rulesList: {
    display: "grid",
    gap: "14px",
    paddingLeft: 0,
    listStyle: "none",
  },

  rule: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    color: "#475569",
    lineHeight: 1.6,
  },

  checkmark: {
    color: "#15803d",
    fontWeight: 700,
    flexShrink: 0,
  },

  error: {
    margin: "16px 0",
    padding: "12px 14px",
    borderRadius: "9px",
    background: "#fef2f2",
    color: "#b91c1c",
  },

  success: {
    margin: "16px 0",
    padding: "12px 14px",
    borderRadius: "9px",
    background: "#f0fdf4",
    color: "#166534",
  },

  footer: {
    padding: "28px 0 10px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

export default CommunityDetail;