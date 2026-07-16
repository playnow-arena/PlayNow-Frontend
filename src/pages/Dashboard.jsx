import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { LogOut, Calendar, MapPin, XCircle, CreditCard, ChevronRight, AlertTriangle, Building2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const formatTime = (time) => {
  if (!time) return '';

  const [hourValue, minute = '00'] = time.split(':');
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

const formatSlotDate = (slot) => {
  if (!slot?.date) return 'Date unavailable';

  return new Date(slot.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatSlotTimes = (slots = []) => {
  if (!slots.length) return 'Time unavailable';

  return slots
    .map((slot) => [formatTime(slot.startTime), formatTime(slot.endTime)].filter(Boolean).join(' - '))
    .filter(Boolean)
    .join(', ');
};

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' • ') || venue?.location || 'Location unavailable'
);

const getSlotStartDateTime = (slot) => {
  if (!slot?.date || !slot?.startTime) return null;

  const slotDate = new Date(slot.date);
  const [hours, minutes = '0'] = slot.startTime.split(':').map(Number);
  if (Number.isNaN(slotDate.getTime()) || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate;
};

const getCancelState = (booking) => {
  if (booking.bookingStatus === 'cancelled' || booking.paymentStatus === 'refunded') {
    return { canCancel: false, label: 'Cancelled' };
  }

  if (booking.bookingStatus === 'completed') {
    return { canCancel: false, label: 'Completed' };
  }

  const firstSlotStart = getSlotStartDateTime(booking.slotIds?.[0]);
  if (firstSlotStart && firstSlotStart <= new Date()) {
    return { canCancel: false, label: 'Match started' };
  }

  return {
    canCancel: booking.bookingStatus === 'confirmed' && booking.paymentStatus !== 'refunded',
    label: 'Match started'
  };
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const isOwner = user?.role === 'owner' || (Array.isArray(user?.roles) && user.roles.includes('owner'));
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [cancelModal, setCancelModal] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setBookingsLoading(true);
      setBookingsError('');

      try {
        const token = localStorage.getItem('playnow_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const [bookingsRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/bookings/my`, { headers }),
          fetch(`${API_BASE_URL}/api/users/me`, { headers })
        ]);
        
        const bookingsData = await bookingsRes.json();
        const profileData = await profileRes.json();

        if (bookingsRes.ok) setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        else setBookingsError(bookingsData.message || 'Failed to load bookings');
        
        if (profileRes.ok) setProfile(profileData);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setBookingsError('Unable to load dashboard data');
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Use local profile state if available
  const displayUser = profile || user;

  const handleCancelClick = (booking) => {
    setCancelModal(booking);
  };


  const calculateRefund = (booking) => {
    // Mock logic based on cancellation rules: 
    // Today = within 4 hours (10% fee), Tomorrow = before 4 hours (100% refund)
    return booking.paidAmount || 0;
  };

  const confirmCancel = async () => {
    if (!cancelModal || cancelLoading) return;

    setCancelLoading(true);

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/bookings/${cancelModal._id}/cancel`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Unable to cancel booking');
        return;
      }

      setBookings((currentBookings) => currentBookings.map((booking) => (
        booking._id === cancelModal._id ? data.booking : booking
      )));
      setCancelModal(null);
      alert(`Refund of Rs ${data.booking?.refundAmount ?? calculateRefund(cancelModal)} is being processed to your original payment method.`);
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Unable to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };


  const handleDirections = (venue) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(venue)}`, '_blank');
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-w-0">
        
          {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 min-w-0">
          <div className="bg-[#151b2b] p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center sticky top-24">
            <div className="w-24 h-24 bg-gradient-energetic rounded-full border-2 border-[#39FF14] flex items-center justify-center mb-4 text-3xl font-bold overflow-hidden">
              {user.profilePhoto && user.profilePhoto !== 'default.jpg' ? (
                <img src={user.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <h2 className="text-xl font-bold break-words max-w-full">{user.name}</h2>
            {user.username && (
              <p className="text-[#39FF14] text-sm font-bold mb-1 break-words max-w-full">@{user.username}</p>
            )}
            <p className="text-gray-400 mb-2 break-words max-w-full">{user.bio}</p>
            <div className="bg-[#0a0f1c] border border-[#39FF14]/50 px-4 py-2 rounded-xl mb-6 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
              <span className="text-xs text-gray-400 block mb-1">PlayNow ID</span>
              <span className="font-mono text-[#39FF14] font-bold tracking-wider break-all">{user.playNowId}</span>
            </div>

            {/* Stats Section */}
            <div className="w-full mb-6 grid grid-cols-2 gap-2">
                <div className="bg-[#0a0f1c] border border-gray-800 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Matches</p>
                    <p className="font-black text-sm">{displayUser.statistics?.matchesPlayed || 0}</p>
                </div>
                <div className="bg-[#0a0f1c] border border-gray-800 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Rating</p>
                    <p className="font-black text-sm">{displayUser.statistics?.rating || 0}</p>
                </div>
            </div>

            {/* Favourites Section */}
            {displayUser.favouriteVenues?.length > 0 && (
              <div className="w-full mb-6">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Favourite Venues</p>
                <div className="space-y-2">
                    {displayUser.favouriteVenues.map((v) => (
                        <Link key={v._id} to={`/venues/${v._id}`} className="block text-xs text-left bg-[#0a0f1c] p-2 rounded-lg border border-gray-800 hover:border-[#39FF14]/50 transition">
                            <span className="font-bold text-white block truncate">{v.name}</span>
                            <span className="text-[10px] text-gray-500 truncate block">{v.address}</span>
                        </Link>
                    ))}
                </div>
              </div>
            )}


            <Link
              to="/edit-profile"
              className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0f1c] px-4 py-3 text-sm font-bold text-white hover:border-[#39FF14]/60 hover:text-[#39FF14] transition"
            >
              <Pencil size={16} /> Edit Profile
            </Link>

            {isOwner && (
              <Link
                to="/owner"
                className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-4 py-3 text-sm font-black text-black hover:bg-[#32E612] transition"
              >
                <Building2 size={18} /> Owner Dashboard
              </Link>
            )}
            
            <div className="w-full space-y-2 mb-6">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition border ${
                  activeTab === 'bookings' ? 'bg-gray-800 border-[#39FF14]/50' : 'bg-[#0a0f1c] border-gray-800 hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center"><Calendar size={18} className={`mr-3 ${activeTab === 'bookings' ? 'text-[#39FF14]' : 'text-gray-400'}`} /> My Bookings</span>
                <ChevronRight size={18} className={activeTab === 'bookings' ? 'text-[#39FF14]' : 'text-gray-500'} />
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition border ${
                  activeTab === 'payments' ? 'bg-gray-800 border-[#39FF14]/50' : 'bg-[#0a0f1c] border-gray-800 hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center"><CreditCard size={18} className={`mr-3 ${activeTab === 'payments' ? 'text-[#39FF14]' : 'text-gray-400'}`} /> Payment History</span>
                <ChevronRight size={18} className={activeTab === 'payments' ? 'text-[#39FF14]' : 'text-gray-500'} />
              </button>
            </div>

            <button onClick={logout} className="w-full flex items-center justify-center text-red-500 hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition border border-transparent hover:border-red-500/50">
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 lg:w-3/4 space-y-8 min-w-0">
          
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && (
              <motion.section 
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Calendar size={24} className="mr-2 text-[#39FF14]" /> Upcoming Bookings
                </h2>
                
                <div className="space-y-4">
                  {bookingsLoading ? (
                    <div className="bg-[#151b2b] p-8 rounded-2xl border border-gray-800 text-center text-gray-400">
                      Loading bookings...
                    </div>
                  ) : bookingsError ? (
                    <div className="bg-red-500/10 p-8 rounded-2xl border border-red-500/30 text-center text-red-400">
                      {bookingsError}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="bg-[#151b2b] p-8 rounded-2xl border border-gray-800 text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-gray-500" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">No bookings yet</h3>
                      <p className="text-gray-400 mb-6">Book a venue slot and your confirmation will appear here.</p>
                      <Link to="/venues" className="bg-[#39FF14] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#32E612] transition inline-block">
                        Find a Venue
                      </Link>
                    </div>
                  ) : (
                    bookings.map((booking) => {
                      const cancelState = getCancelState(booking);

                      return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={booking._id} 
                        className="bg-[#151b2b] p-4 sm:p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 min-w-0"
                      >
                        <div className="min-w-0 w-full">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className="bg-[#0a0f1c] px-2 py-1 rounded border border-gray-700 text-xs font-mono text-gray-400 break-all">#{booking.bookingCode || (booking._id || '').slice(-8).toUpperCase()}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${booking.bookingStatus === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                              {booking.bookingStatus || 'unknown'}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-bold bg-gray-800 text-gray-300">
                              {booking.paymentStatus || 'payment unknown'}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold mb-1 break-words">{booking.venueId?.name || 'Venue unavailable'}</h3>
                          <p className="text-gray-500 text-sm flex items-start mb-1 min-w-0">
                            <MapPin size={14} className="mr-2 mt-0.5 shrink-0" /> <span className="break-words">{formatVenueLocation(booking.venueId)}</span>
                          </p>
                          <p className="text-gray-400 text-sm flex items-start mb-1 min-w-0">
                            <Calendar size={14} className="mr-2 mt-0.5 shrink-0" /> <span className="break-words">{formatSlotDate(booking.slotIds?.[0])} | {formatSlotTimes(booking.slotIds)}</span>
                          </p>
                          <p className="text-gray-400 text-sm flex items-start min-w-0">
                            <CreditCard size={14} className="mr-2 mt-0.5 shrink-0" /> <span className="break-words">Paid {formatCurrency(booking.paidAmount)} of {formatCurrency(booking.totalAmount)}</span>
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => handleDirections(`${booking.venueId?.name || ''} ${formatVenueLocation(booking.venueId)}`)}
                            className="flex-1 md:flex-none bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 px-4 py-2 rounded-xl transition font-medium text-sm text-center flex items-center justify-center gap-2"
                          >
                            <MapPin size={14} /> Directions
                          </button>
                        </div>
                      </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === 'payments' && (
              <motion.section
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CreditCard size={24} className="mr-2 text-[#39FF14]" /> Payment History
                </h2>
                
                <div className="bg-[#151b2b] rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="divide-y divide-gray-800">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Booking Code</p>
                            <p className="font-mono text-sm text-white break-all">#{booking.bookingCode}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${booking.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                          <div>
                            <p className="text-sm font-bold text-white mb-0.5">{booking.venueId?.name}</p>
                            <p className="text-xs text-gray-500">{formatSlotDate(booking.slotIds?.[0])}</p>
                          </div>
                          <p className="text-xl font-black text-[#39FF14]">₹{booking.paidAmount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="bg-gradient-energetic p-6 rounded-2xl border border-[#39FF14]/20 mt-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#39FF14] rounded-full blur-[80px] opacity-20"></div>
            <h3 className="text-xl font-bold mb-2">Want to host a match?</h3>
            <p className="text-gray-300 mb-4 max-w-md">Split costs with strangers and make new sports buddies. Host a match today!</p>
            <Link to="/host-match" className="inline-block w-full sm:w-auto text-center bg-[#39FF14] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#32E612] transition shadow-lg relative z-10">
              Host Match Now
            </Link>
          </section>

        </div>
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#151b2b] w-full max-w-md rounded-3xl border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            >
              <div className="p-6 border-b border-gray-800">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Cancel Booking?</h3>
                <p className="text-gray-400 text-sm">
                  {cancelModal.venueId?.name || 'Venue unavailable'} | {formatSlotDate(cancelModal.slotIds?.[0])} | {formatSlotTimes(cancelModal.slotIds)}
                </p>
              </div>
              
              <div className="p-6 bg-[#0a0f1c]">
                <h4 className="font-bold text-sm mb-3 text-gray-300">CANCELLATION RULES CHECK</h4>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="font-medium">₹{cancelModal.paidAmount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-green-500">
                    <span>MVP cancellation preview</span>
                    <span>-₹0</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t border-gray-800 pt-3">
                    <span className="text-white">Total Refund</span>
                    <span className="text-[#39FF14]">₹{calculateRefund(cancelModal)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setCancelModal(null)}
                    className="flex-1 bg-transparent border border-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
                  >
                    Keep Booking
                  </button>
                  <button 
                    onClick={confirmCancel}
                    disabled={cancelLoading}
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
