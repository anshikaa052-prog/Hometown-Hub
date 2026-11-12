
import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import socket from "./socket";

// Lazy-loaded pages
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Communities = lazy(() => import("./pages/Communities"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const CommunityChat = lazy(() => import("./pages/CommunityChat"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminCommunityApprovals = lazy(() => import("./pages/AdminCommunityApprovals"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));

function App() {
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      return;
    }

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinUserRoom", userId);
      console.log("Joined notification room:", userId);
    };

    socket.on("connect", handleConnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/communities"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminCommunityApprovals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communities"
            element={
              <ProtectedRoute>
                <Communities />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communities/:communityId"
            element={
              <ProtectedRoute>
                <CommunityDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communities/:communityId/feed"
            element={
              <ProtectedRoute>
                <CommunityFeed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communities/:communityId/chat"
            element={
              <ProtectedRoute>
                <CommunityChat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:eventId"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
