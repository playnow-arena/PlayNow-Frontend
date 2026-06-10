import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import MatchDetails from './pages/MatchDetails';
import NotificationCenter from './pages/NotificationCenter';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div className="min-h-screen w-full overflow-x-hidden pb-24 md:pb-0 bg-[#0a0f1c] text-white flex flex-col justify-between">
          <Navbar />
          <div className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/venues/:id" element={<VenueDetail />} />
              <Route path="/book/:id" element={<Booking />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
              <Route path="/owner" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/partner/login" element={<OwnerAuth />} />
              <Route path="/partner/register" element={<PartnerRegister />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Navigate to="/super-admin-portal-2026" replace /></ProtectedRoute>} />
              <Route path="/super-admin-portal-2026" element={<ProtectedRoute requiredRole="admin"><AdminPortal /></ProtectedRoute>} />
              <Route path="/host-match" element={<HostMatch />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/cancellation" element={<Cancellation />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/match/:id" element={<MatchDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <BottomNav />
        </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
