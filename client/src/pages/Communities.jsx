
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../Communities.css";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
  });

  const fetchCommunities = async (searchTerm = "") => {
    try {
      setLoading(true);
      setError("");

      const response = searchTerm.trim()
        ? await API.get(
            `/communities/search?search=${encodeURIComponent(
              searchTerm.trim()
            )}`
          )
        : await API.get("/communities");

      setCommunities(response.data.communities || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load communities. Please try again."
      );
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateCommunity = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");

      await API.post("/communities", formData);

      setFormData({
        name: "",
        city: "",
        description: "",
      });

      await fetchCommunities(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create community. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchCommunities(search);
  };

  const handleClear = () => {
    setSearch("");
    fetchCommunities("");
  };

  return (
    <div className="communities-page">
      <header className="communities-header">
        <div>
          <p className="communities-brand">Hometown Hub</p>
          <h1>Find Your Community</h1>
          <p>
            Connect with people, share experiences, and stay
            connected to your hometown.
          </p>
        </div>

        <Link to="/dashboard" className="communities-home-button">
          Back to Dashboard
        </Link>
      </header>

      {error && (
        <div className="communities-error" role="alert">
          {error}
          <button
            type="button"
            onClick={() => fetchCommunities(search)}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      <section className="communities-section">
        <h2>Search Communities</h2>
        <p>Find communities by name or city.</p>

        <form
          className="communities-search"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Enter community name or city"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            className="communities-clear-button"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </form>
      </section>

      <section className="communities-section">
        <h2>Create a Community</h2>
        <p>Bring people together around your hometown.</p>

        <form
          className="communities-form"
          onSubmit={handleCreateCommunity}
        >
          <label htmlFor="community-name">
            Community Name
          </label>
          <input
            id="community-name"
            type="text"
            name="name"
            placeholder="Enter community name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="community-city">City</label>
          <input
            id="community-city"
            type="text"
            name="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label htmlFor="community-description">
            Description
          </label>
          <textarea
            id="community-description"
            name="description"
            placeholder="Tell people about this community"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />

          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Community"}
          </button>
        </form>
      </section>

      <section className="communities-list-section">
        <div className="communities-list-heading">
          <div>
            <h2>Explore Communities</h2>
            <p>Discover and join your local community.</p>
          </div>

          <span className="communities-count">
            {communities.length}{" "}
            {communities.length === 1 ? "Community" : "Communities"}
          </span>
        </div>

        {loading ? (
          <div className="communities-message" role="status">
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "4px solid #e0e7ff",
                borderTop: "4px solid #4f46e5",
                borderRadius: "50%",
                animation: "communitySpin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Loading communities...
            <style>
              {`
                @keyframes communitySpin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : error ? (
          <div className="communities-empty">
            <h3>Unable to load communities</h3>
            <p>Please check your connection and try again.</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="communities-empty">
            <h3>No communities found</h3>
            <p>
              {search.trim()
                ? "Try searching with a different name or city."
                : "No communities are available yet. Be the first to create one!"}
            </p>
          </div>
        ) : (
          <div className="communities-grid">
            {communities.map((community) => (
              <article
                key={community._id}
                className="community-card"
              >
                <div className="community-card-icon">
                  {community.name?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <h3>{community.name}</h3>

                <p className="community-city">
                  <strong>City:</strong> {community.city}
                </p>

                <p className="community-description">
                  {community.description ||
                    "No description available yet."}
                </p>

                <p className="community-members">
                  Members:{" "}
                  {Array.isArray(community.members)
                    ? community.members.length
                    : 0}
                </p>

                <Link
                  to={`/communities/${community._id}`}
                  className="community-view-button"
                >
                  View Community
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="communities-footer">
        Hometown Hub — Stay connected to your roots.
      </footer>
    </div>
  );
}

export default Communities;
