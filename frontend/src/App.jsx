import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import Landing   from "./pages/Landing";
import Login     from "./pages/Login";
import Register  from "./pages/Register";

// Protected pages
import Dashboard      from "./pages/Dashboard";
import Profile        from "./pages/Profile";
import FindRoommates  from "./pages/FindRoommates";
import Messages       from "./pages/Messages";
import Listings       from "./pages/Listings";
import CreateListing  from "./pages/CreateListing";
import PublicProfile  from "./pages/PublicProfile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users/:userId" element={<PublicProfile />} />

        {/* ── Protected ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/find-roommates" element={
          <ProtectedRoute><FindRoommates /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="/messages/:userId" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="/listings" element={
          <ProtectedRoute><Listings /></ProtectedRoute>
        } />
        <Route path="/listings/new" element={
          <ProtectedRoute><CreateListing /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;