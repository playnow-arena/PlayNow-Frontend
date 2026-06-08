import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import HostMatch from './pages/HostMatch';
import Feed from './pages/Feed';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerAuth from './pages/OwnerAuth';
import PartnerRegister from './pages/PartnerRegister';
import AdminPortal from './pages/AdminPortal';
import Cancellation from './pages/Cancellation';
import Properties from './pages/Properties';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div className="min-h-screen pb-24 md:pb-0 bg-[#0a0f1c] text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
            <Route path="/book/:id" element={<Booking />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/partner/login" element={<OwnerAuth />} />
            <Route path="/partner/register" element={<PartnerRegister />} />
            <Route path="/admin" element={<Navigate to="/super-admin-portal-2026" replace />} />
            <Route path="/super-admin-portal-2026" element={<ProtectedRoute requiredRole="admin"><AdminPortal /></ProtectedRoute>} />
            <Route path="/host-match" element={<HostMatch />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/cancellation" element={<Cancellation />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
