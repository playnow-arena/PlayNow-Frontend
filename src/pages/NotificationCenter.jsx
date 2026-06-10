import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Trash2, Check, Filter, Search, Settings, Calendar, Award, MessageSquare, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
  const { user, updateProfile } = useAuth();
  
  // Settings & Center state
  const [activeTab, setActiveTab] = useState('center'); // 'center' or 'preferences'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Preference Settings State
  const [prefForm, setPrefForm] = useState({
    booking: true,
    match: true,
    review: true,
    system: true
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load preferences from user context
  useEffect(() => {
    if (user && user.notificationPreferences) {
      setPrefForm({
        booking: user.notificationPreferences.booking !== false,
        match: user.notificationPreferences.match !== false,
        review: user.notificationPreferences.review !== false,
        system: user.notificationPreferences.system !== false
      });
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    setLoading(true);
    try {
      let url = `/api/notifications?page=${page}&limit=10`;
      if (filterType) url += `&type=${filterType}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setTotalPages(data.pages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'center') {
      fetchNotifications();
    }
  }, [page, filterType, debouncedSearch, activeTab]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n._id));
    }
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.length === 0) return;
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/read-selected', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (selectedIds.includes(n._id) ? { ...n, isRead: true } : n))
        );
        setSelectedIds([]);
        setSuccessMsg('Selected notifications marked as read');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/delete-selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        fetchNotifications();
        setSelectedIds([]);
        setSuccessMsg('Selected notifications deleted');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          notificationPreferences: prefForm
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Trigger context refresh if available
        if (updateProfile) {
          updateProfile(data);
        }
        setSuccessMsg('Notification preferences saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar className="text-[#39FF14]" size={16} />;
      case 'match': return <Award className="text-blue-400" size={16} />;
      case 'review': return <MessageSquare className="text-yellow-400" size={16} />;
      case 'system':
      case 'admin': return <AlertTriangle className="text-red-400" size={16} />;
      default: return <Bell className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header tabs */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider flex items-center gap-3">
              <Bell className="text-[#39FF14]" /> Notification Hub
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase mt-1">Manage alerts and preference details</p>
          </div>
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab('center')}
              className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition ${activeTab === 'center' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition ${activeTab === 'preferences' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Global Notification Success Feedback */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] font-bold text-xs uppercase tracking-wider text-center">
            {successMsg}
          </div>
        )}

        {activeTab === 'center' ? (
          <div className="space-y-6">
            
            {/* Filters / Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111625] p-4 rounded-2xl border border-white/5">
              
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search size={16} className="absolute left-4 top-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search notification messages…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 transition"
                />
              </div>

              {/* Type Select */}
              <div className="relative">
                <Filter size={14} className="absolute left-4 top-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-gray-200 focus:outline-none focus:border-[#39FF14]/50 transition appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="booking">Bookings</option>
                  <option value="match">Matches</option>
                  <option value="review">Reviews</option>
                  <option value="system">System Alerts</option>
                </select>
              </div>

            </div>

            {/* Bulk Actions Header */}
            {notifications.length > 0 && (
              <div className="flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === notifications.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-600 bg-black text-[#39FF14] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 font-bold uppercase">Select All</span>
                </div>
                
                {selectedIds.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkSelectedRead}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition"
                    >
                      <Check size={12} /> Mark Read
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#111625] h-20 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 bg-[#111625] rounded-2xl border border-white/5 border-dashed">
                <Bell size={40} className="mx-auto mb-3 text-gray-700 animate-bounce" />
                <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">No notifications found</p>
                <p className="text-gray-600 text-xs mt-1">Try adjusting your active filters or query parameters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <motion.div
                    key={n._id}
                    className={`flex items-start gap-4 p-4 bg-[#111625] rounded-2xl border border-white/5 relative group transition ${n.isRead ? 'opacity-75' : 'shadow-[0_0_15px_rgba(57,255,20,0.03)]'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(n._id)}
                      onChange={() => handleToggleSelect(n._id)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-black text-[#39FF14] focus:ring-0 cursor-pointer shrink-0"
                    />

                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 shrink-0">
                      {getTypeIcon(n.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">{n.title}</h3>
                        {!n.isRead && (
                          <span className="bg-[#39FF14]/10 text-[#39FF14] font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-tighter">NEW</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-gray-600 font-bold block mt-2">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-[#111625] border border-white/5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-40 hover:text-[#39FF14]"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-[#111625] border border-white/5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-40 hover:text-[#39FF14]"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        ) : (
          /* Preferences Panel */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#111625] p-6 rounded-2xl border border-white/5 shadow-2xl"
          >
            <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2">
              <Settings className="text-[#39FF14]" size={20} /> Channel Controls
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold mb-6">
              Turn off channels to restrict alerts. You will still be able to complete bookings and join games seamlessly.
            </p>

            <form onSubmit={handleSavePreferences} className="space-y-5">
              {[
                { key: 'booking', title: 'Booking Confirmations', desc: 'Updates regarding turf slots, approvals and booking actions' },
                { key: 'match', title: 'Match Activations', desc: 'Alerts when users join matches hosted by you or active notifications' },
                { key: 'review', title: 'Reviews & Feedback', desc: 'Updates on reviews submitted to your turf or comments' },
                { key: 'system', title: 'System Announcements', desc: 'Critical technical notifications and admin service status updates' }
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefForm(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none ${prefForm[item.key] ? 'bg-[#39FF14]' : 'bg-gray-800'}`}
                  >
                    <span className={`w-4 h-4 bg-black rounded-full absolute transition-transform ${prefForm[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-3 bg-[#39FF14] hover:bg-[#32E612] text-black font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg"
              >
                Save Settings
              </button>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default NotificationCenter;
