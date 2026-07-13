import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import BookingRealtimeAlerts from './components/BookingRealtimeAlerts';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FCMNotificationManager from './components/FCMNotificationManager';
import ScrollToTop from './components/ScrollToTop';
import LoadingFallback from './components/LoadingFallback';

const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Venues = lazy(() => import('./pages/Venues'));
const VenueDetail = lazy(() => import('./pages/VenueDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const HostMatch = lazy(() => import('./pages/HostMatch'));
const Feed = lazy(() => import('./pages/Feed'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminOwnerAuth = lazy(() => import('./pages/AdminOwnerAuth'));
const PartnerRegister = lazy(() => import('./pages/PartnerRegister'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));
const Cancellation = lazy(() => import('./pages/Cancellation'));
const Properties = lazy(() => import('./pages/Properties'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const MatchDetails = lazy(() => import('./pages/MatchDetails'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <ScrollToTop />
        <div className="min-h-screen w-full overflow-x-hidden pb-24 md:pb-0 bg-[#0a0f1c] text-white flex flex-col justify-between">
          <Navbar />
          <BookingRealtimeAlerts />
          <PWAInstallPrompt />
          <FCMNotificationManager />
          <div className="flex-grow flex flex-col">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/venues/:id" element={<VenueDetail />} />
                <Route path="/book/:id" element={<Booking />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
                <Route path="/owner" element={<ProtectedRoute requiredRole={['owner', 'admin']}><OwnerDashboard /></ProtectedRoute>} />
                <Route path="/partner/login" element={<AdminOwnerAuth />} />
                <Route path="/admin-login" element={<AdminOwnerAuth />} />
                <Route path="/partner/register" element={<ProtectedRoute requiredRole="player"><PartnerRegister /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Navigate to="/super-admin-portal-2026" replace /></ProtectedRoute>} />
                <Route path="/super-admin-portal-2026" element={<ProtectedRoute requiredRole="admin"><AdminPortal /></ProtectedRoute>} />
                <Route path="/host-match" element={<ProtectedRoute><HostMatch /></ProtectedRoute>} />
                <Route path="/open-matches" element={<Feed />} />
                <Route path="/feed" element={<Navigate to="/open-matches" replace />} />
                <Route path="/cancellation" element={<Cancellation />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/match/:id" element={<MatchDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
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
