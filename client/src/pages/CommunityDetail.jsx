import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [uploading, setUploading] = useState(false);

  const communityRules = [
    "Be respectful and polite to all community members.",
    "Do not post abusive, hateful, or offensive content.",
    "Share only relevant and useful information.",
    "Do not spam or post misleading information.",
    "Respect the privacy of other community members.",
  ];

  const fetchCommunity = async () => {
    try {
      const response = await API.get(`/communities/${communityId}`);
      setCommunity(response.data.community);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [communityId]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      const response = await API.post(`/communities/${communityId}/join`);
      alert(response.data.message);
      await fetchCommunity();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join community");
    } finally {
      setJoining(false);
    }
  };

  const handleCoverImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const data = new FormData();
      data.append("coverImage", file);

      const response = await API.post(
        `/communities/${communityId}/cover`,
        data
      );

      alert(response.data.message);
      await fetchCommunity();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Community cover image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading community...</p>;
  if (!community) return <p>Community not found.</p>;

  return (
    <div>
      <h1>{community.name}</h1>

      {community.coverImage && (
        <div>
          <img
            src={community.coverImage}
            alt={community.name}
            width="500"
          />
        </div>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverImage}
          disabled={uploading}
        />
        {uploading && <p>Uploading cover image...</p>}
      </div>

      <p>City: {community.city}</p>
      <p>{community.description || "No description available"}</p>
      <p>Members: {community.memberCount}</p>

      {community.createdBy && (
        <p>Created by: {community.createdBy.name}</p>
      )}

      <button onClick={handleJoin} disabled={joining}>
        {joining ? "Joining..." : "Join Community"}
      </button>

      <br />
      <br />

      <button
        type="button"
        onClick={() => navigate(`/communities/${communityId}/feed`)}
      >
        Open Community Feed
      </button>

      {" "}

      <button
        type="button"
        onClick={() => navigate(`/communities/${communityId}/chat`)}
      >
        Open Community Chat 💬
      </button>

      <hr />

      <div>
        <h2>Community Rules & Guidelines</h2>
        <ul>
          {communityRules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CommunityDetail;