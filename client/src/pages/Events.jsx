import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Events.css";

function Events() {
  const [communityId, setCommunityId] = useState("");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchEvents = async (e) => {
    if (e) e.preventDefault();

    if (!communityId.trim()) {
      alert("Please enter a Community ID");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      setFilterDate("");

      const response = await API.get(
        `/events/community/${communityId.trim()}`
      );

      const eventList = response.data.events || [];

      setEvents(eventList);
      setFilteredEvents(eventList);
    } catch (error) {
      setEvents([]);
      setFilteredEvents([]);

      alert(
        error.response?.data?.message || "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (e) => {
    const selectedDate = e.target.value;

    setFilterDate(selectedDate);

    if (!selectedDate) {
      setFilteredEvents(events);
      return;
    }

    setFilteredEvents(
      events.filter((event) => {
        const eventDate = String(event.date || "").slice(0, 10);
        return eventDate === selectedDate;
      })
    );
  };

  const clearFilter = () => {
    setFilterDate("");
    setFilteredEvents(events);
  };

  return (
    <main className="events-page">
      <section className="events-container">
        <header className="events-header">
          <span className="events-eyebrow">YOUR COMMUNITY</span>
          <h1>Community Events</h1>
          <p>Discover events and stay connected with your community.</p>
        </header>

        <section className="events-search-card">
          <h2>Find Community Events</h2>
          <p>Enter your community ID to explore its events.</p>

          <form className="events-search-form" onSubmit={fetchEvents}>
            <input
              type="text"
              placeholder="Enter Community ID"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              aria-label="Community ID"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Find Events"}
            </button>
          </form>

          <Link className="events-create-link" to="/events/create">
            <span aria-hidden="true">＋</span> Create a New Event
          </Link>
        </section>

        {searched && !loading && events.length > 0 && (
          <section className="events-filter-card">
            <div className="events-filter-heading">
              <h2>Filter Events</h2>
              <span>{filteredEvents.length} found</span>
            </div>

            <label htmlFor="eventDate">Filter by date</label>

            <div className="events-filter-controls">
              <input
                id="eventDate"
                type="date"
                value={filterDate}
                onChange={handleDateFilter}
              />

              <button
                className="events-clear-button"
                type="button"
                onClick={clearFilter}
              >
                Clear Filter
              </button>
            </div>
          </section>
        )}

        {loading && (
          <p className="events-message" role="status">
            Loading events...
          </p>
        )}

        {!loading && searched && events.length === 0 && (
          <div className="events-empty-state">
            <span aria-hidden="true">📅</span>
            <h2>No events found</h2>
            <p>There are no events available for this community yet.</p>
          </div>
        )}

        {!loading &&
          searched &&
          events.length > 0 &&
          filteredEvents.length === 0 && (
            <div className="events-empty-state">
              <span aria-hidden="true">🔎</span>
              <h2>No events for this date</h2>
              <p>Try another date or clear the filter.</p>
              <button
                className="events-clear-button"
                type="button"
                onClick={clearFilter}
              >
                Clear Filter
              </button>
            </div>
          )}

        {!loading && filteredEvents.length > 0 && (
          <section className="events-list-section">
            <div className="events-list-heading">
              <h2>Events List</h2>
              <span>{filteredEvents.length} events</span>
            </div>

            <div className="events-grid">
              {filteredEvents.map((event) => (
                <article className="event-card" key={event._id}>
                  <div className="event-card-top">
                    <span className="event-card-icon" aria-hidden="true">
                      📅
                    </span>
                    <span className="event-attendee-badge">
                      {event.attendees?.length || 0} attending
                    </span>
                  </div>

                  <h3>{event.title}</h3>

                  <div className="event-info">
                    <p>
                      <span aria-hidden="true">🗓️</span>
                      <strong>Date:</strong> {String(event.date || "").slice(0, 10) || "Not specified"}
                    </p>

                    <p>
                      <span aria-hidden="true">🕒</span>
                      <strong>Time:</strong> {event.time || "Not specified"}
                    </p>

                    <p>
                      <span aria-hidden="true">📍</span>
                      <strong>Location:</strong> {event.location || "Not specified"}
                    </p>
                  </div>

                  <p className="event-description">
                    {event.description || "No description available."}
                  </p>

                  <Link
                    className="event-details-link"
                    to={`/events/${event._id}`}
                  >
                    View Event Details <span aria-hidden="true">→</span>
                  </Link>
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
