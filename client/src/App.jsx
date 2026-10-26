
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Communities from "./pages/Communities";
import ProtectedRoute from "./components/ProtectedRoute";
import CommunityDetail from "./pages/CommunityDetail";
import CommunityFeed from "./pages/CommunityFeed";
import CreateEvent from "./pages/CreateEvent";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Notifications from "./pages/Notifications";
import CommunityChat from "./pages/CommunityChat";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminCommunityApprovals from "./pages/AdminCommunityApprovals";
import AdminCategories from "./pages/AdminCategories";
import socket from "./socket";

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
    </BrowserRouter>
  );
}

export default App;
