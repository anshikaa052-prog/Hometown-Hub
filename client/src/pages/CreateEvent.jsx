
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./CreateEvent.css";

function CreateEvent() {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    communityId: "",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  useEffect(() => {
    let active = true;

    const loadCommunities = async () => {
      try {
        setCommunitiesLoading(true);
        setError("");

        const response = await API.get("/communities");
        const list = response.data?.communities;

        if (!Array.isArray(list)) {
          throw new Error("Unable to read the communities list.");
        }

        if (active) {
          setCommunities(list);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load communities."
          );
        }
      } finally {
        if (active) setCommunitiesLoading(false);
      }
    };

    loadCommunities();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setCoverImage(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      setCoverImage(null);
      setImagePreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      e.target.value = "";
      setCoverImage(null);
      setImagePreview("");
      return;
    }

    setCoverImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.communityId) {
      setError("Please select a community.");
      return;
    }

    if (formData.date < new Date().toLocaleDateString("en-CA")) {
      setError("Please select today or a future date.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/events", formData);
      const event = response.data?.event;

      if (!event?._id) {
        throw new Error(
          "The server did not return the new event ID."
        );
      }

      if (coverImage) {
        const imageData = new FormData();
        imageData.append("coverImage", coverImage);

        await API.post(`/events/${event._id}/cover`, imageData);
      }

      setSuccess("Event created successfully!");

      navigate(`/events/${event._id}`, {
        state: { message: "Event created successfully!" },
      });
    } catch (err) {
      console.error("Create event error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-event-page">
      <div className="create-event-container">
        <Link to="/events" className="create-event-back">
          ← Back to Events
        </Link>

        <header className="create-event-header">
          <div className="create-event-icon">📅</div>
          <p className="create-event-eyebrow">HOMETOWN HUB</p>
          <h1>Create an Event</h1>
          <p>
            Bring your community together. Share an event and
            make new memories.
          </p>
        </header>

        <form className="create-event-card" onSubmit={handleSubmit}>
          {error && (
            <div className="create-event-alert error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="create-event-alert success" role="status">
              {success}
            </div>
          )}

          <div className="create-event-section-title">
            <span>01</span>
            <div>
              <h2>Event Information</h2>
              <p>Tell everyone what your event is about.</p>
            </div>
          </div>

          <div className="create-event-field">
            <label htmlFor="communityId">
              Community <span>*</span>
            </label>
            <select
              id="communityId"
              name="communityId"
              value={formData.communityId}
              onChange={handleChange}
              required
              disabled={communitiesLoading || communities.length === 0}
            >
              <option value="">
                {communitiesLoading
                  ? "Loading communities..."
                  : communities.length === 0
                    ? "No communities available"
                    : "Choose a community"}
              </option>

              {communities.map((community) => (
                <option key={community._id} value={community._id}>
                  {community.name} — {community.city}
                </option>
              ))}
            </select>
            {!communitiesLoading && communities.length === 0 && (
              <small>
                Create or join a community before creating an event.
              </small>
            )}
          </div>

          <div className="create-event-field">
            <label htmlFor="title">
              Event Title <span>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Hometown Reunion 2026"
              value={formData.title}
              onChange={handleChange}
              maxLength={120}
              required
            />
          </div>

          <div className="create-event-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="What will happen at your event?"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
            />
            <small>{formData.description.length}/2000 characters</small>
          </div>

          <div className="create-event-section-title">
            <span>02</span>
            <div>
              <h2>Date, Time & Location</h2>
              <p>Help attendees know where and when to meet.</p>
            </div>
          </div>

          <div className="create-event-two-columns">
            <div className="create-event-field">
              <label htmlFor="date">
                Date <span>*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="time">
                Time <span>*</span>
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="create-event-field">
            <label htmlFor="location">
              Location <span>*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Enter venue or meeting location"
              value={formData.location}
              onChange={handleChange}
              maxLength={200}
              required
            />
          </div>

          <div className="create-event-section-title">
            <span>03</span>
            <div>
              <h2>Event Cover</h2>
              <p>Add an image to make your event stand out.</p>
            </div>
          </div>

          <div className="create-event-field">
            <label htmlFor="coverImage">Cover Image (Optional)</label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>Image formats supported. Maximum size: 5 MB.</small>

            {imagePreview && (
              <div className="create-event-image-preview">
                <img src={imagePreview} alt="Event cover preview" />
                <button
                  type="button"
                  className="create-event-remove-image"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview("");
                    setCoverImage(null);
                    const input = document.getElementById("coverImage");
                    if (input) input.value = "";
                  }}
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <div className="create-event-actions">
            <Link to="/events" className="create-event-cancel">
              Cancel
            </Link>

            <button
              type="submit"
              className="create-event-submit"
              disabled={loading || communitiesLoading || communities.length === 0}
            >
              {loading ? "Creating Event..." : "Create Event →"}
            </button>
          </div>
        </form>

        <p className="create-event-footer">
          Hometown Hub · Stay connected to your roots.
        </p>
      </div>
    </main>
  );
}

export default CreateEvent;
