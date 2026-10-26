import { useEffect, useState } from "react";
import API from "../services/api";
import "../Communities.css";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
  });

  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCommunities = async () => {
    try {
      const response = await API.get("/communities");

      setCommunities(response.data.communities);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to load communities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      const response = await API.post(
        "/communities",
        formData
      );

      alert(response.data.message);

      setFormData({
        name: "",
        city: "",
        description: "",
      });

      fetchCommunities();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create community"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchCommunities();
      return;
    }

    try {
      const response = await API.get(
        `/communities/search?search=${search}`
      );

      setCommunities(response.data.communities);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to search communities"
      );
    }
  };

  if (loading) {
    return <p>Loading communities...</p>;
  }

  return (
    <div className="communities-page">
      <h1>Communities</h1>

      <div className="community-section">
        <h2>Search Communities</h2>

        <div className="community-search">
          <input
            type="text"
            placeholder="Search by community name or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="community-button"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            type="button"
            className="community-button"
            onClick={() => {
              setSearch("");
              fetchCommunities();
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <hr />

      <div className="community-section">
        <h2>Create Community</h2>

        <form
          onSubmit={handleCreateCommunity}
          className="community-form"
        >
          <input
            type="text"
            name="name"
            placeholder="Community Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Community Description"
            value={formData.description}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="community-button"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Community"}
          </button>
        </form>
      </div>

      <hr />

      <div>
        {communities.length === 0 ? (
          <p>No communities found.</p>
        ) : (
          communities.map((community) => (
            <div
              key={community._id}
              className="community-card"
            >
              <h2>{community.name}</h2>

              <p>City: {community.city}</p>

              <p>
                {community.description ||
                  "No description available"}
              </p>

              <p>
                Members: {community.members.length}
              </p>

              <a
                href={`/communities/${community._id}`}
                className="view-button"
              >
                View Community
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Communities;