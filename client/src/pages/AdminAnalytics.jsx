import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/admin/analytics");
        setAnalytics(response.data.analytics);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load analytics. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const cards = analytics
    ? [
        { title: "Total Users", value: analytics.totalUsers },
        { title: "Daily Active Users (24h)", value: analytics.dailyActiveUsers },
        { title: "Blocked Users", value: analytics.blockedUsers },
        { title: "Total Communities", value: analytics.totalCommunities },
        { title: "Approved Communities", value: analytics.approvedCommunities },
        { title: "Pending Communities", value: analytics.pendingCommunities },
        { title: "Total Posts", value: analytics.totalPosts },
        { title: "Total Likes", value: analytics.totalLikes },
        { title: "Total Comments", value: analytics.totalComments },
        { title: "Engagement (likes + comments per post)", value: analytics.engagementRate },
        { title: "Total Events", value: analytics.totalEvents },
        { title: "Total Attendees", value: analytics.totalAttendees },
        { title: "Average Attendees per Event", value: analytics.eventParticipationRate },
        { title: "Total Reports", value: analytics.totalReports },
        { title: "Pending Reports", value: analytics.pendingReports },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Analytics
            </h1>
            <p className="mt-2 text-gray-600">
              Overview of users, communities, engagement, events, and reports.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="rounded-lg bg-gray-800 px-5 py-2 text-white hover:bg-gray-700"
          >
            Back to Admin Dashboard
          </button>
        </div>

        {loading && (
          <p className="rounded-lg bg-white p-5 text-gray-700">
            Loading analytics...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-white p-5">
            <p className="mb-3 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && analytics && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <h2 className="text-sm font-medium text-gray-500">
                    {card.title}
                  </h2>
                  <p className="mt-3 break-words text-3xl font-bold text-blue-700">
                    {card.value ?? 0}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Community Growth
              </h2>

              {analytics.communitiesOverTime?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.communitiesOverTime.map((item) => (
                    <div
                      key={`${item._id.year}-${item._id.month}`}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <span className="text-gray-700">
                        {new Date(
                          item._id.year,
                          item._id.month - 1
                        ).toLocaleDateString("en", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-semibold text-blue-700">
                        {item.total} new communities
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No community growth data available yet.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;