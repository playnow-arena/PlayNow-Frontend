import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MapPin, Bell, UserCircle, Search, Trash2, Check, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const Navbar = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const isOwner = user?.role === 'owner' || (Array.isArray(user?.roles) && user.roles.includes('owner'));

  const isAuthPage = location.pathname === '/login';
  const isAdminPage = location.pathname === '/super-admin-portal-2026' || location.pathname === '/admin';

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const notificationIdsRef = useRef(new Set());

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count & initial notifications
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async (pageNum = 1, append = false) => {
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setNotifications(prev => {
            const merged = [...prev, ...data.notifications]
              .filter((item, index, list) => list.findIndex(n => n._id === item._id) === index);
            notificationIdsRef.current = new Set(merged.map(item => item._id));
            return merged;
          });
        } else {
          notificationIdsRef.current = new Set(data.notifications.map(item => item._id));
          setNotifications(data.notifications);
        }
        setHasMore(data.page < data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications(1, false);
      setPage(1);
    } else {
      notificationIdsRef.current.clear();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    const refreshNotifications = () => {
      fetchUnreadCount();
      fetchNotifications(1, false);
      setPage(1);
    };
    window.addEventListener('playnow:notifications-changed', refreshNotifications);
    return () => window.removeEventListener('playnow:notifications-changed', refreshNotifications);
  }, []);

  // Real-time notification socket handler
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        if (notificationIdsRef.current.has(notification._id)) return;
        notificationIdsRef.current.add(notification._id);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };
      socket.on('new_notification', handleNewNotification);
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket]);

  const handleMarkRead = async (id) => {
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card navigation / mark read
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const deleted = notifications.find(n => n._id === id);
        notificationIdsRef.current.delete(id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchNotifications(nextPage, true);
    setPage(nextPage);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification._id);
    }
    setShowDropdown(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (isAuthPage || isAdminPage) return null;

  return (
    <>
      {/* Desktop & Mobile Combined Notification Dropdown Menu Helper */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-md border-b border-gray-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group py-1">
                <img 
                  src="/logo.png" 
                  alt="PlayNow" 
                  className="h-9 w-9 object-cover rounded-xl transition-all duration-300 group-hover:brightness-110 border border-white/10" 
                />
                <span className="brand-font text-xl font-black tracking-tighter text-white group-hover:text-[#39FF14] transition-colors">
                  Play<span className="text-[#39FF14] group-hover:text-white transition-colors">Now</span>
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/venues" className="text-gray-300 hover:text-[#39FF14] font-medium transition">Venues</Link>
              <Link to="/host-match" className="text-gray-300 hover:text-[#39FF14] font-medium transition">Host Match</Link>
              <Link to="/open-matches" className="text-gray-300 hover:text-[#39FF14] font-medium transition">Open Matches</Link>
              
              <div className="w-px h-6 bg-gray-700"></div>

              {user ? (
                <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                  {isOwner && (
                    <Link
                      to="/owner"
                      className="bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition"
                    >
                      Owner Dashboard
                    </Link>
                  )}
                  {/* Notification Bell */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)} 
                      className="text-gray-300 hover:text-white cursor-pointer transition p-1 relative"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#39FF14] text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Card */}
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-80 bg-[#0a0f1c]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden"
                        >
                          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                            <span className="text-sm font-black uppercase tracking-wider text-white">Notifications</span>
                            {unreadCount > 0 && (
                              <button 
                                onClick={handleMarkAllRead}
                                className="text-xs text-[#39FF14] hover:underline font-bold flex items-center gap-1"
                              >
                                <CheckSquare size={12} /> Mark all read
                              </button>
                            )}
                          </div>

                          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <Bell size={28} className="mx-auto mb-2 text-gray-700" />
                                <p className="text-xs font-bold uppercase tracking-wide">All caught up!</p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n._id}
                                  onClick={() => handleNotificationClick(n)}
                                  className={`p-4 transition cursor-pointer relative group ${n.isRead ? 'bg-transparent hover:bg-white/5' : 'bg-[#39FF14]/5 hover:bg-[#39FF14]/10'}`}
                                >
                                  {!n.isRead && (
                                    <span className="absolute left-2 top-4 w-1.5 h-1.5 bg-[#39FF14] rounded-full" />
                                  )}
                                  <div className="pl-2 pr-6">
                                    <h4 className="text-xs font-black text-white uppercase tracking-wider">{n.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">{n.message}</p>
                                    <span className="text-[9px] text-gray-600 font-bold block mt-2 uppercase">
                                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                        hour: '2-digit', minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  
                                  {/* Delete option */}
                                  <button
                                    onClick={(e) => handleDelete(n._id, e)}
                                    className="absolute right-3 top-3 p-1 rounded bg-black/20 text-gray-500 hover:text-red-400 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {hasMore && (
                            <button
                              onClick={handleLoadMore}
                              disabled={loading}
                              className="w-full text-center py-2.5 bg-black/20 hover:bg-black/40 text-xs font-bold text-gray-400 hover:text-[#39FF14] transition border-t border-white/5"
                            >
                              {loading ? 'Loading...' : 'LOAD MORE'}
                            </button>
                          )}
                          <Link
                            to="/notifications"
                            onClick={() => setShowDropdown(false)}
                            className="block w-full text-center py-2.5 bg-black/40 hover:bg-[#39FF14] hover:text-black text-[10px] font-black uppercase tracking-widest transition border-t border-white/5 text-[#39FF14]"
                          >
                            View All Notifications
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to={isOwner ? '/owner' : '/dashboard'} className="flex items-center gap-2 hover:opacity-80 transition min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                      {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserCircle size={32} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-white truncate max-w-32">{user.name}</span>
                      {user.username && (
                        <span className="block text-[10px] font-bold text-[#39FF14] truncate max-w-32">@{user.username}</span>
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="bg-[#39FF14] text-black px-5 py-2 rounded-full font-bold hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header (Minimal) */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-lg border-b border-white/5 md:hidden px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 py-1">
          <img 
            src="/logo.png" 
            alt="PlayNow" 
            className="h-8 w-8 object-cover rounded-lg border border-white/10" 
          />
          <span className="brand-font text-lg font-black tracking-tighter text-white">
            Play<span className="text-[#39FF14]">Now</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="text-gray-400 hover:text-white transition p-2 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#39FF14] text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-72 bg-[#0a0f1c]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/40">
                      <span className="text-xs font-black uppercase tracking-wider text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-[#39FF14] hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <p className="text-[10px] font-bold uppercase tracking-wide">No new updates</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 transition cursor-pointer relative ${n.isRead ? 'bg-transparent' : 'bg-[#39FF14]/5'}`}
                          >
                            <div className="pr-4">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-wider">{n.title}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 leading-normal">{n.message}</p>
                            </div>
                            <button
                              onClick={(e) => handleDelete(n._id, e)}
                              className="absolute right-2 top-2 p-1 rounded text-gray-600 hover:text-red-400"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button className="text-gray-400 hover:text-white transition p-1">
            <Search size={20} />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
