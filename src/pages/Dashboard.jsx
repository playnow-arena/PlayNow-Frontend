import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { LogOut, Calendar, MapPin, XCircle, CreditCard, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [cancelModal, setCancelModal] = useState(null);
  
  const [bookings, setBookings] = useState([
    { id: 'BK-10293', venue: 'Smash Arena', date: 'Today', slots: '06:00 PM', status: 'Confirmed', paid: 400, total: 400 },
    { id: 'BK-00122', venue: 'Kickoff Turf', date: 'Tomorrow', slots: '08:00 PM, 09:00 PM', status: 'Advance Paid', paid: 200, total: 2400 },
  ]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleCancelClick = (booking) => {
    setCancelModal(booking);
  };

  const calculateRefund = (booking) => {
    // Mock logic based on cancellation rules: 
    // Today = within 4 hours (10% fee), Tomorrow = before 4 hours (100% refund)
    if (booking.date === 'Today') {
      return (booking.paid * 0.9).toFixed(0);
    }
    return booking.paid;
  };

  const confirmCancel = () => {
    if (cancelModal) {
      setBookings(bookings.filter(b => b.id !== cancelModal.id));
      setCancelModal(null);
      // Mock processing alert
      alert(`Refund of ₹${calculateRefund(cancelModal)} is being processed to your original payment method.`);
    }
  };

  const handleDirections = (venue) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(venue)}`, '_blank');
  };

  return (
    <div className="pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-[#151b2b] p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center sticky top-24">
            <div className="w-24 h-24 bg-gradient-energetic rounded-full border-2 border-[#39FF14] flex items-center justify-center mb-4 text-3xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-400 mb-2">{user.phone}</p>
            <div className="bg-[#0a0f1c] border border-[#39FF14]/50 px-4 py-2 rounded-xl mb-6 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
              <span className="text-xs text-gray-400 block mb-1">PlayNow ID</span>
              <span className="font-mono text-[#39FF14] font-bold tracking-wider">{user.id}</span>
            </div>
            
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
        <div className="w-full md:w-2/3 lg:w-3/4 space-y-8">
          
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
                  {bookings.length === 0 ? (
                    <div className="bg-[#151b2b] p-8 rounded-2xl border border-gray-800 text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-gray-500" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">No upcoming bookings</h3>
                      <p className="text-gray-400 mb-6">You don't have any matches scheduled right now.</p>
                      <Link to="/venues" className="bg-[#39FF14] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#32E612] transition inline-block">
                        Find a Venue
                      </Link>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={booking.id} 
                        className="bg-[#151b2b] p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#0a0f1c] px-2 py-1 rounded border border-gray-700 text-xs font-mono text-gray-400">{booking.id}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                              {booking.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-1">{booking.venue}</h3>
                          <p className="text-gray-400 text-sm flex items-center mb-1">
                            <Calendar size={14} className="mr-2" /> {booking.date} | {booking.slots}
                          </p>
                          <p className="text-gray-400 text-sm flex items-center">
                            <CreditCard size={14} className="mr-2" /> Paid ₹{booking.paid} of ₹{booking.total}
                          </p>
                        </div>
                        
                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => handleDirections(booking.venue)}
                            className="flex-1 md:flex-none bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 px-4 py-2 rounded-xl transition font-medium text-sm text-center flex items-center justify-center gap-2"
                          >
                            <MapPin size={14} /> Directions
                          </button>
                          <button 
                            onClick={() => handleCancelClick(booking)}
                            className="flex-1 md:flex-none flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl transition font-medium text-sm text-center"
                          >
                            <XCircle size={14} className="mr-1" /> Cancel
                          </button>
                        </div>
                      </motion.div>
                    ))
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
                
                {/* Desktop Table / Mobile Cards */}
                <div className="bg-[#151b2b] rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0a0f1c] border-b border-gray-800">
                        <tr>
                          <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-500">Transaction</th>
                          <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-500">Date</th>
                          <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-500">Venue</th>
                          <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-500">Amount</th>
                          <th className="p-4 text-sm font-bold uppercase tracking-widest text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'TXN-99281', date: 'Today', venue: 'Smash Arena', amount: 400, status: 'Successful' },
                          { id: 'TXN-88219', date: 'Yesterday', venue: 'Kickoff Turf', amount: 200, status: 'Successful' },
                          { id: 'TXN-77342', date: 'Oct 12, 2026', venue: 'Greenfield Turf', amount: 800, status: 'Failed' }
                        ].map((txn) => (
                          <tr key={txn.id} className="border-b border-gray-800 hover:bg-[#0a0f1c]/30 transition group">
                            <td className="p-4 font-mono text-sm group-hover:text-[#39FF14] transition-colors">{txn.id}</td>
                            <td className="p-4 text-sm text-gray-300">{txn.date}</td>
                            <td className="p-4 text-sm font-bold">{txn.venue}</td>
                            <td className="p-4 text-[#39FF14] font-black">₹{txn.amount}</td>
                            <td className={`p-4 text-sm font-black uppercase tracking-tighter ${txn.status === 'Successful' ? 'text-green-500' : 'text-red-500'}`}>{txn.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-800">
                    {[
                      { id: 'TXN-99281', date: 'Today', venue: 'Smash Arena', amount: 400, status: 'Successful' },
                      { id: 'TXN-88219', date: 'Yesterday', venue: 'Kickoff Turf', amount: 200, status: 'Successful' },
                      { id: 'TXN-77342', date: 'Oct 12, 2026', venue: 'Greenfield Turf', amount: 800, status: 'Failed' }
                    ].map((txn) => (
                      <div key={txn.id} className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Transaction ID</p>
                            <p className="font-mono text-sm text-white">{txn.id}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${txn.status === 'Successful' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {txn.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm font-bold text-white mb-0.5">{txn.venue}</p>
                            <p className="text-xs text-gray-500">{txn.date}</p>
                          </div>
                          <p className="text-xl font-black text-[#39FF14]">₹{txn.amount}</p>
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
            <Link to="/host-match" className="inline-block bg-[#39FF14] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#32E612] transition shadow-lg relative z-10">
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
                  {cancelModal.venue} • {cancelModal.date} | {cancelModal.slots}
                </p>
              </div>
              
              <div className="p-6 bg-[#0a0f1c]">
                <h4 className="font-bold text-sm mb-3 text-gray-300">CANCELLATION RULES CHECK</h4>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="font-medium">₹{cancelModal.paid}</span>
                  </div>
                  
                  {cancelModal.date === 'Today' ? (
                    <div className="flex justify-between text-sm text-yellow-500">
                      <span>Within 4 hours (10% fee)</span>
                      <span>-₹{(cancelModal.paid * 0.1).toFixed(0)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Before 4 hours (Free)</span>
                      <span>-₹0</span>
                    </div>
                  )}
                  
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
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    Confirm Cancel
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
