import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Settings, Bell, Calendar, Clock, MapPin, DollarSign, PlusCircle, Volume2, Power } from 'lucide-react';
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

const canCollectBalance = (booking) => (
  Number(booking.remainingAmount || 0) > 0 &&
  booking.bookingStatus !== 'cancelled' &&
  booking.paymentStatus !== 'completed'
);

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('bookings');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionMethods, setCollectionMethods] = useState({});
  const [collectionLoadingId, setCollectionLoadingId] = useState('');
  const [collectionMessage, setCollectionMessage] = useState('');

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('playnow_token');
        const [bookingsRes, venuesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/bookings/owner`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/venues/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const bookingsData = await bookingsRes.json();
        const venuesData = await venuesRes.json();

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setVenues(Array.isArray(venuesData) ? venuesData : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('newBooking', (data) => {
      setNotificationData(data);
      setShowNotification(true);
      
      // Add to bookings list
      setBookings(prev => [data, ...prev]);

      // Play sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play prevented', e));
      
      setTimeout(() => setShowNotification(false), 5000);
    });

    socket.on('bookingCancelled', (data) => {
      // Update booking status in list
      setBookings(prev => prev.map(b => 
        b._id === data.bookingId ? { ...b, bookingStatus: 'cancelled' } : b
      ));
    });

    socket.on('slotStatusChanged', (data) => {
      // Logic to update UI if showing slots
    });

    return () => {
      socket.off('newBooking');
      socket.off('bookingCancelled');
      socket.off('slotStatusChanged');
    };
  }, [socket]);

  const handleEmergencyClose = async (venueId) => {
    if (!window.confirm('Are you sure? This will block ALL remaining slots for today!')) return;
    
    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/slots/emergency-close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ venueId })
      });
      
      if (res.ok) {
        alert('Venue closed for today.');
      }
    } catch (error) {
      console.error('Emergency close failed:', error);
    }
  };

  const handleCollectionMethodChange = (bookingId, method) => {
    setCollectionMethods((current) => ({ ...current, [bookingId]: method }));
  };

  const simulateBooking = () => {
    setNotificationData({
      venueName: venues[0]?.name || 'Your Venue',
      slots: [{ startTime: 'New booking' }],
      totalAmount: 0,
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleCollectBalance = async (booking) => {
    const bookingId = booking._id || booking.id;
    const method = collectionMethods[bookingId] || 'cash';
    setCollectionMessage('');
    setCollectionLoadingId(bookingId);

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/collect-balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCollectionMessage(data.message || 'Unable to collect balance');
        return;
      }

      setBookings((currentBookings) => currentBookings.map((item) => (
        (item._id || item.id) === bookingId ? data : item
      )));
      setCollectionMessage('Balance marked as collected.');
    } catch (error) {
      console.error('Collect balance error:', error);
      setCollectionMessage('Unable to collect balance. Please try again.');
    } finally {
      setCollectionLoadingId('');
    }
  };

  return (
    <div className="pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-400">Manage your venues and bookings.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={simulateBooking} className="bg-[#151b2b] border border-gray-800 p-3 rounded-xl hover:border-[#39FF14] transition relative group">
            <Bell size={20} className="text-gray-400 group-hover:text-[#39FF14]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#39FF14] rounded-full"></span>
          </button>
          <button onClick={logout} className="bg-red-500/10 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition font-medium">
            Logout
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#151b2b] border-2 border-[#39FF14] p-4 rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.4)] flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-12 h-12 bg-[#39FF14] rounded-full flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(57,255,20,0.5)]">
              <Volume2 size={24} className="text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#39FF14]">New Booking Received!</h3>
              <p className="text-sm text-gray-300">
                {notificationData?.venueName || 'Your Venue'} • {notificationData?.slots?.[0]?.startTime || 'New Slot'}
              </p>
              <p className="text-xs text-[#39FF14] mt-1 font-bold">₹{notificationData?.totalAmount || '0'} Paid</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 hide-scrollbar">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition ${activeTab === 'bookings' ? 'bg-[#39FF14] text-black' : 'bg-[#151b2b] text-gray-400 hover:text-white'}`}
        >
          Today's Bookings
        </button>
        <button 
          onClick={() => setActiveTab('venues')}
          className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition ${activeTab === 'venues' ? 'bg-[#39FF14] text-black' : 'bg-[#151b2b] text-gray-400 hover:text-white'}`}
        >
          Manage Venues
        </button>
        <button 
          onClick={() => setActiveTab('slots')}
          className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition ${activeTab === 'slots' ? 'bg-[#39FF14] text-black' : 'bg-[#151b2b] text-gray-400 hover:text-white'}`}
        >
          Block Slots
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-[#151b2b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-black/20">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center">
               <Calendar className="mr-3 text-[#39FF14]" /> {venues[0]?.name || 'Arena'} - Today
            </h2>
            <div className="flex items-center bg-[#39FF14]/10 px-5 py-3 rounded-2xl border border-[#39FF14]/20 shadow-inner">
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest mr-3">Daily Revenue:</span>
              <span className="font-black text-xl text-[#39FF14]">₹1,200</span>
            </div>
          </div>

          {collectionMessage && (
            <div className={`mx-6 md:mx-8 mt-4 rounded-xl px-4 py-3 text-sm border ${collectionMessage.toLowerCase().includes('collected') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
              {collectionMessage}
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 text-gray-500 text-xs font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-6">Booking ID</th>
                  <th className="p-6">Venue</th>
                  <th className="p-6">Player</th>
                  <th className="p-6">Slot</th>
                  <th className="p-6">Payment</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-600 font-bold uppercase tracking-widest text-sm italic">No matches scheduled for today yet.</td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const bookingId = b._id || b.id;
                    const shouldShowCollect = canCollectBalance(b);

                    return (
                    <tr key={bookingId} className="border-b border-white/5 hover:bg-white/5 transition group align-top">
                      <td className="p-6 font-mono text-sm text-gray-500 group-hover:text-[#39FF14]">{bookingId.slice(-8).toUpperCase()}</td>
                      <td className="p-6">
                        <p className="font-black text-white">{b.venueId?.name || 'Venue unavailable'}</p>
                        <p className="text-xs text-gray-500 mt-1">{b.venueId?.location || 'Location unavailable'}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-black text-white">{b.userId?.name || b.user || 'Guest'}</p>
                        {b.userId?.phone && <p className="text-xs text-gray-500 mt-1">{b.userId.phone}</p>}
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-gray-300">{formatSlotDate(b.slotIds?.[0])}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatSlotTimes(b.slotIds)}</p>
                      </td>
                      <td className="p-6 text-sm">
                        <p className="text-gray-400">Total: <span className="font-bold text-white">{formatCurrency(b.totalAmount)}</span></p>
                        <p className="text-gray-400">Paid: <span className="font-bold text-[#39FF14]">{formatCurrency(b.paidAmount)}</span></p>
                        <p className="text-gray-400">Remaining: <span className="font-bold text-yellow-400">{formatCurrency(b.remainingAmount)}</span></p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500">{b.paymentStatus || 'payment unknown'}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          b.bookingStatus === 'completed' || b.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          b.bookingStatus === 'confirmed' || b.status === 'Paid' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' :
                          b.bookingStatus === 'pending' || b.status === 'Advance Paid' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {b.bookingStatus || b.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {shouldShowCollect ? (
                          <div className="flex flex-col gap-2 items-end">
                            <select
                              value={collectionMethods[bookingId] || 'cash'}
                              onChange={(e) => handleCollectionMethodChange(bookingId, e.target.value)}
                              className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39FF14]"
                            >
                              <option value="cash">Cash</option>
                              <option value="upi">UPI</option>
                              <option value="card">Card</option>
                            </select>
                            <button
                              onClick={() => handleCollectBalance(b)}
                              disabled={collectionLoadingId === bookingId}
                              className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {collectionLoadingId === bookingId ? 'Collecting...' : 'Mark Balance Collected'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">No balance due</span>
                        )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
             {bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">No bookings for today.</div>
             ) : (
                bookings.map((b) => {
                  const bookingId = b._id || b.id;
                  const shouldShowCollect = canCollectBalance(b);

                  return (
                  <div key={bookingId} className="p-6 space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">ID: {bookingId.slice(-8).toUpperCase()}</p>
                           <h3 className="font-black text-lg text-white">{b.userId?.name || b.user || 'Guest'}</h3>
                           {b.userId?.phone && <p className="text-xs text-gray-500 mt-1">{b.userId.phone}</p>}
                           <p className="text-xs text-gray-400 mt-2">{b.venueId?.name || 'Venue unavailable'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          b.bookingStatus === 'confirmed' || b.status === 'Paid' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-gray-800 text-gray-500'
                        }`}>
                           {b.bookingStatus || b.status}
                        </span>
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="flex items-center text-sm font-bold text-gray-400">
                           <Clock size={14} className="mr-2 text-[#39FF14]" />
                           {formatSlotDate(b.slotIds?.[0])} | {formatSlotTimes(b.slotIds)}
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-600 uppercase mb-0.5">Amount Paid</p>
                           <p className="text-xl font-black text-[#39FF14]">₹{b.paidAmount || b.paid || 0}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3 bg-[#0a0f1c] border border-gray-800 rounded-2xl p-4">
                        <div>
                           <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Total</p>
                           <p className="text-sm font-black text-white">{formatCurrency(b.totalAmount)}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Paid</p>
                           <p className="text-sm font-black text-[#39FF14]">{formatCurrency(b.paidAmount)}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Remaining</p>
                           <p className="text-sm font-black text-yellow-400">{formatCurrency(b.remainingAmount)}</p>
                        </div>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                       Payment: {b.paymentStatus || 'payment unknown'}
                     </p>
                     {shouldShowCollect && (
                       <div className="flex flex-col gap-3">
                         <select
                           value={collectionMethods[bookingId] || 'cash'}
                           onChange={(e) => handleCollectionMethodChange(bookingId, e.target.value)}
                           className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#39FF14]"
                         >
                           <option value="cash">Cash</option>
                           <option value="upi">UPI</option>
                           <option value="card">Card</option>
                         </select>
                         <button
                           onClick={() => handleCollectBalance(b)}
                           disabled={collectionLoadingId === bookingId}
                           className="w-full bg-[#39FF14] text-black font-bold px-4 py-3 rounded-xl text-sm hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {collectionLoadingId === bookingId ? 'Collecting...' : 'Mark Balance Collected'}
                         </button>
                       </div>
                     )}
                  </div>
                  );
                })
             )}
          </div>
        </div>
      )}

      {activeTab === 'venues' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-xl flex items-center hover:bg-[#32E612] transition">
              <PlusCircle size={18} className="mr-2" /> Add New Venue
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-[#151b2b] rounded-2xl border border-gray-800">
                <p className="text-gray-500">No venues found. Register your first venue to get started.</p>
              </div>
            ) : (
              venues.map(v => (
                <div key={v._id || v.id} className="bg-[#151b2b] p-6 rounded-2xl border border-gray-800 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-[-100%] group-hover:translate-y-0 transition-transform bg-[#0a0f1c]/80 backdrop-blur-sm rounded-bl-2xl">
                    <button 
                      onClick={() => handleEmergencyClose(v._id || v.id)}
                      className="bg-red-500/20 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition"
                      title="Emergency Close"
                    >
                      <Power size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-[#39FF14] p-2"><Settings size={18} /></button>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{v.name}</h3>
                  <div className="flex gap-2 mb-6">
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{v.sportTypes?.[0] || v.type}</span>
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{v.courts || '4'} Courts</span>
                    {!v.isActive && <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded font-bold">Closed</span>}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Price per Hour (₹)</label>
                      <div className="flex items-center bg-[#0a0f1c] rounded-xl px-4 py-2 border border-gray-700">
                        <DollarSign size={16} className="text-[#39FF14] mr-2" />
                        <input type="number" defaultValue={v.pricePerHour || v.price} className="bg-transparent w-full focus:outline-none text-white" />
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-6 bg-[#1f2937] hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition">
                    Save Changes
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'slots' && (
        <div className="bg-[#151b2b] p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold mb-6">Block Slots Manually</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Venue</label>
              <select className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]">
                <option>Smash Arena</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Date</label>
              <input type="date" className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Reason</label>
              <input type="text" placeholder="e.g. Maintenance" className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]" />
            </div>
          </div>
          
          <h3 className="font-medium mb-3">Select Slots to Block</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '04:00 PM', '05:00 PM', '06:00 PM'].map(slot => (
              <button key={slot} className="bg-[#0a0f1c] border border-gray-700 hover:border-red-500 py-2 rounded-xl text-sm transition focus:bg-red-500/20 focus:border-red-500">
                {slot}
              </button>
            ))}
          </div>
          
          <button className="bg-red-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            Block Selected Slots
          </button>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
