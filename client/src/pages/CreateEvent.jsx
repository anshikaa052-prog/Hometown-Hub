import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    communityId: "",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file && !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      setCoverImage(null);
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      alert("Image size must be 5 MB or less.");
      e.target.value = "";
      setCoverImage(null);
      return;
    }

    setCoverImage(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Step 1: Create event
      const response = await API.post("/events", formData);
      const event = response.data.event;

      if (!event?._id) {
        throw new Error("Event was created, but its ID was not returned.");
      }

      // Step 2: Upload cover image if selected
      if (coverImage) {
        const imageData = new FormData();
        imageData.append("coverImage", coverImage);

        await API.post(
          `/events/${event._id}/cover`,
          imageData
        );
      }

      alert(
        coverImage
          ? "Event created and cover image uploaded successfully."
          : "Event created successfully."
      );

      navigate(`/events/${event._id}`);
    } catch (error) {
      console.error("Create event error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to create event."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Event</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="communityId">Community ID</label>
          <input
            id="communityId"
            type="text"
            name="communityId"
            value={formData.communityId}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="title">Event Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="time">Time</label>
          <input
            id="time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="coverImage">Event Cover Image (Optional)</label>
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {coverImage && (
            <p>Selected image: {coverImage.name}</p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Creating Event..."
            : "Create Event"}
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;