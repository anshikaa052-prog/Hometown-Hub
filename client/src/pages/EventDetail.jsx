import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

function EventDetail() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // Fetch event details
  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/events/${eventId}`);

      setEvent(response.data.event);
    } catch (err) {
      console.error("Failed to load event:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load event details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // Join event
  const handleJoinEvent = async () => {
    try {
      setJoining(true);

      const response = await API.post(
        `/events/${eventId}/join`
      );

      setEvent(response.data.event);

      alert(
        response.data.message || "Joined event successfully"
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to join event."
      );
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Unable to Load Event</h2>
        <p>{error || "Event not found."}</p>
        <Link to="/events">Back to Events</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "20px",
      }}
    >
      <Link to="/events">← Back to Events</Link>

      <h1>{event.title}</h1>

      {/* Event Cover Image */}
      {event.coverImage && (
        <img
          src={event.coverImage}
          alt={`${event.title} cover`}
          style={{
            display: "block",
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        />
      )}

      <p>
        <strong>Description:</strong>{" "}
        {event.description || "No description available"}
      </p>

      <p>
        <strong>Date:</strong> {event.date}
      </p>

      <p>
        <strong>Time:</strong> {event.time}
      </p>

      <p>
        <strong>Location:</strong> {event.location}
      </p>

      <p>
        <strong>Community:</strong>{" "}
        {event.community?.name || "Community"}
      </p>

      <p>
        <strong>Created By:</strong>{" "}
        {event.createdBy?.name || "Unknown"}
      </p>

      <button
        type="button"
        onClick={handleJoinEvent}
        disabled={joining}
      >
        {joining ? "Joining..." : "Join Event"}
      </button>

      <hr />

      <h2>
        Attendees ({event.attendees?.length || 0})
      </h2>

      {event.attendees?.length > 0 ? (
        <ul>
          {event.attendees.map((attendee) => (
            <li key={attendee._id}>
              {attendee.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No attendees yet. Be the first to join!</p>
      )}
    </div>
  );
}

export default EventDetail;