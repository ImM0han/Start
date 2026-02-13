import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyJobs from "./pages/MyJobs";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import ForgotPassword from "./pages/ForgotPassword";
import Wallet from "./pages/Wallet";
import ClientDashboard from "./pages/ClientDashboard";
import PostJob from "./pages/PostJob";

function Private({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  // If user is authenticated and tries to access splash page, redirect to appropriate dashboard
  if (token && window.location.pathname === "/") {
    return role === "client" ? <Navigate to="/client-dashboard" replace /> : <Navigate to="/dashboard" replace />;
  }
  
  return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();
  const hideTopNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/myjobs") ||
    location.pathname.startsWith("/wallet") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/post-job") ||
    location.pathname.startsWith("/client-dashboard"); // splash + auth pages

  return (
    <>
      {!hideTopNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/client-dashboard" element={<Private><ClientDashboard /></Private>} />
        <Route path="/post-job" element={<Private><PostJob /></Private>} />
        <Route path="/myjobs" element={<Private><MyJobs /></Private>} />
        <Route path="/wallet" element={<Private><Wallet /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />
        <Route path="/chat/:jobId" element={<Private><Chat /></Private>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}