
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Events.css";

function Events() {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [joiningEvent, setJoiningEvent] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [userResponse, communityResponse] = await Promise.all([
        API.get("/test/protected"),
        API.get("/communities"),
      ]);

      const currentUser =
        userResponse.data.user || userResponse.data;

      const currentUserId =
        currentUser.userId || currentUser._id || currentUser.id;

      setUserId(currentUserId);

      const allCommunities =
        communityResponse.data.communities || [];

      const joinedCommunities = allCommunities.filter((community) =>
        community.members?.some((member) => {
          const memberId =
            typeof member === "object" ? member._id : member;

          return String(memberId) === String(currentUserId);
        })
      );

      setCommunities(joinedCommunities);

      if (joinedCommunities.length === 0) {
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      const results = await Promise.allSettled(
        joinedCommunities.map((community) =>
          API.get(`/events/community/${community._id}`)
        )
      );

      const failedRequests = results.some(
        (result) => result.status === "rejected"
      );

      const allEvents = results.flatMap((result) => {
        if (result.status !== "fulfilled") {
          return [];
        }

        return result.value.data.events || [];
      });

      if (failedRequests && allEvents.length === 0) {
        setError("Failed to load events. Please try again.");
      }

      const upcomingEvents = allEvents
        .filter((event) => {
          const eventDate = String(event.date || "").slice(0, 10);
          return eventDate >= getTodayDate();
        })
        .sort((a, b) => {
          const dateA = String(a.date || "").slice(0, 10);
          const dateB = String(b.date || "").slice(0, 10);

          if (dateA !== dateB) {
            return dateA.localeCompare(dateB);
          }

          return String(a.time || "").localeCompare(
            String(b.time || "")
          );
        });

      setEvents(upcomingEvents);
      setFilteredEvents(upcomingEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityChange = (e) => {
    const communityId = e.target.value;

    setSelectedCommunity(communityId);
    setFilterDate("");
    setSuccess("");

    if (communityId === "all") {
      setFilteredEvents(events);
      return;
    }

    setFilteredEvents(
      events.filter((event) => {
        const eventCommunity =
          typeof event.community === "object"
            ? event.community?._id
            : event.community;

        return String(eventCommunity) === String(communityId);
      })
    );
  };

  const handleDateFilter = (e) => {
    const date = e.target.value;

    setFilterDate(date);
    setSuccess("");

    let result = events;

    if (selectedCommunity !== "all") {
      result = result.filter((event) => {
        const eventCommunity =
          typeof event.community === "object"
            ? event.community?._id
            : event.community;

        return String(eventCommunity) === String(selectedCommunity);
      });
    }

    if (date) {
      result = result.filter(
        (event) =>
          String(event.date || "").slice(0, 10) === date
      );
    }

    setFilteredEvents(result);
  };

  const handleJoinEvent = async (eventId) => {
    try {
      setJoiningEvent(eventId);
      setError("");
      setSuccess("");

      const response = await API.post(`/events/${eventId}/join`);

      const updatedEvent = response.data.event;

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          event._id === eventId ? updatedEvent : event
        )
      );

      setFilteredEvents((previousEvents) =>
        previousEvents.map((event) =>
          event._id === eventId ? updatedEvent : event
        )
      );

      setSuccess("You have successfully joined this event!");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to join event. Please try again."
      );
    } finally {
      setJoiningEvent(null);
    }
  };

  const isJoined = (event) =>
    event.attendees?.some((attendee) => {
      const attendeeId =
        typeof attendee === "object"
          ? attendee._id
          : attendee;

      return String(attendeeId) === String(userId);
    });

  const clearDateFilter = () => {
    setFilterDate("");
    handleCommunityChange({
      target: { value: selectedCommunity },
    });
  };

  return (
    <main className="events-page">
      <section className="events-container">
        <header className="events-banner">
          <div>
            <span className="events-eyebrow">
              YOUR COMMUNITY
            </span>

            <h1>Community Events</h1>

            <p>
              Discover upcoming events and stay connected
              with your communities.
            </p>

            <Link
              to="/dashboard"
              className="events-back-button"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <Link
            to="/events/create"
            className="events-create-button"
          >
            + Create a New Event
          </Link>
        </header>

        {error && (
          <div
            className="events-empty-state"
            role="alert"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchPageData}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {success && (
          <div
            className="events-success-message"
            role="status"
          >
            {success}
          </div>
        )}

        <section className="events-filter-card">
          <div className="events-filter-field">
            <label htmlFor="communityFilter">
              Select Community
            </label>

            <select
              id="communityFilter"
              value={selectedCommunity}
              onChange={handleCommunityChange}
              disabled={loading}
            >
              <option value="all">All my communities</option>

              {communities.map((community) => (
                <option
                  key={community._id}
                  value={community._id}
                >
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          <div className="events-filter-field">
            <label htmlFor="eventDate">
              Filter by Date
            </label>

            <input
              id="eventDate"
              type="date"
              min={getTodayDate()}
              value={filterDate}
              onChange={handleDateFilter}
              disabled={loading}
            />
          </div>

          {filterDate && (
            <button
              type="button"
              className="events-clear-button"
              onClick={clearDateFilter}
            >
              Clear Date
            </button>
          )}
        </section>

        {loading && (
          <div className="events-message" role="status">
            <span className="events-loader"></span>
            <p>Loading upcoming events...</p>
          </div>
        )}

        {!loading && !error && communities.length === 0 && (
          <div className="events-empty-state">
            <span>🏘️</span>
            <h2>No communities joined yet</h2>
            <p>
              Join a community to discover its upcoming events.
            </p>

            <Link to="/communities">
              Explore Communities
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          communities.length > 0 &&
          filteredEvents.length === 0 && (
            <div className="events-empty-state">
              <span>📅</span>
              <h2>
                {filterDate
                  ? "No events on this date"
                  : selectedCommunity !== "all"
                  ? "No upcoming events in this community"
                  : "No upcoming events yet"}
              </h2>
              <p>
                {filterDate
                  ? "Try selecting another date."
                  : "You can create an event and bring your community together."}
              </p>

              <Link to="/events/create">
                Create an Event
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          filteredEvents.length > 0 && (
            <section className="events-list-section">
              <div className="events-list-heading">
                <div>
                  <h2>Upcoming Events</h2>
                  <p>
                    Explore what's happening in your communities.
                  </p>
                </div>

                <span>
                  {filteredEvents.length}{" "}
                  {filteredEvents.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <article
                    className="event-card"
                    key={event._id}
                  >
                    <div className="event-card-top">
                      <span className="event-card-icon">
                        📅
                      </span>

                      <span className="event-attendee-badge">
                        {event.attendees?.length || 0} attending
                      </span>
                    </div>

                    <span className="event-community-name">
                      {event.community?.name || "Community Event"}
                    </span>

                    <h3>{event.title}</h3>

                    <div className="event-info">
                      <p>
                        <span>🗓️</span>
                        <strong>Date:</strong>{" "}
                        {String(event.date || "").slice(0, 10)}
                      </p>

                      <p>
                        <span>🕒</span>
                        <strong>Time:</strong>{" "}
                        {event.time || "Not specified"}
                      </p>

                      <p>
                        <span>📍</span>
                        <strong>Location:</strong>{" "}
                        {event.location || "Not specified"}
                      </p>
                    </div>

                    <p className="event-description">
                      {event.description ||
                        "No description available."}
                    </p>

                    <div className="event-card-actions">
                      <Link
                        className="event-details-link"
                        to={`/events/${event._id}`}
                      >
                        View Details →
                      </Link>

                      <button
                        type="button"
                        className="event-join-button"
                        disabled={
                          isJoined(event) ||
                          joiningEvent === event._id
                        }
                        onClick={() => handleJoinEvent(event._id)}
                      >
                        {isJoined(event)
                          ? "Joined"
                          : joiningEvent === event._id
                          ? "Joining..."
                          : "Join Event"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
      </section>
    </main>
  );
}

export default Events;
