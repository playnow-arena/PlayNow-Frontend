import React, { useEffect, useState } from 'react';
import { Shield, Users, Building2, XCircle, AlertTriangle, BarChart3, Search, Mail, RefreshCw, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emptyVenueForm = {
  name: '',
  sportTypes: '',
  location: '',
  address: '',
  pricePerHour: '',
  amenities: '',
  description: '',
  imageUrl: '',
  isActive: true,
};

const emptySlotForm = {
  venueId: '',
  date: '',
  startTime: '',
  endTime: '',
  price: '',
};

const emptyGenerateSlotsForm = {
  venueId: '',
  startDate: '',
  openingTime: '06:00',
  closingTime: '23:00',
  slotDurationMinutes: '60',
  price: '',
  days: '30',
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const toList = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const readResponseBody = async (res) => {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getVenueErrorMessage = (body, fallback) => {
  if (body?.message) return body.message;
  if (body?.error) return body.error;
  if (typeof body === 'string') return body;
  return fallback;
};

const formatRequestDate = (date) => {
  if (!date) return 'Date unavailable';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatMoney = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatSlotDate = (slot) => {
  if (!slot?.date) return 'Date unavailable';

  return new Date(slot.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (time) => {
  if (!time) return '';

  const [hourValue, minute = '00'] = time.split(':');
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${period}`;
};

const formatSlotTimes = (slots = []) => {
  if (!slots.length) return 'Time unavailable';

  return slots
    .map((slot) => [formatTime(slot.startTime), formatTime(slot.endTime)].filter(Boolean).join(' - '))
    .filter(Boolean)
    .join(', ');
};

const canCollectBookingBalance = (booking) => (
  Number(booking?.remainingAmount || 0) > 0 &&
  booking?.bookingStatus !== 'cancelled' &&
  booking?.paymentStatus !== 'completed'
);

const AdminPortal = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [activeSection, setActiveSection] = useState('venues');
  const [venues, setVenues] = useState([]);
  const [venueForm, setVenueForm] = useState(emptyVenueForm);
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueError, setVenueError] = useState('');
  const [venueImageUploading, setVenueImageUploading] = useState(false);
  const [venueImageMessage, setVenueImageMessage] = useState('');
  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [slotMessage, setSlotMessage] = useState('');
  const [slotLoading, setSlotLoading] = useState(false);
  const [generateSlotsForm, setGenerateSlotsForm] = useState(emptyGenerateSlotsForm);
  const [generateSlotsMessage, setGenerateSlotsMessage] = useState('');
  const [generateSlotsSummary, setGenerateSlotsSummary] = useState(null);
  const [generateSlotsLoading, setGenerateSlotsLoading] = useState(false);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [ownerRequestsLoading, setOwnerRequestsLoading] = useState(false);
  const [ownerRequestMessage, setOwnerRequestMessage] = useState('');
  const [ownerRequestActionId, setOwnerRequestActionId] = useState('');
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminBookingsLoading, setAdminBookingsLoading] = useState(false);
  const [adminBookingsMessage, setAdminBookingsMessage] = useState('');
  const [bookingFilters, setBookingFilters] = useState({
    status: '',
    paymentStatus: '',
    venueId: '',
    date: '',
  });
  const [bookingCollectionMethods, setBookingCollectionMethods] = useState({});
  const [bookingCollectionLoadingId, setBookingCollectionLoadingId] = useState('');

  const fetchVenues = async () => {
    setVenuesLoading(true);
    setVenueError('');

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(apiUrl('/api/venues'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (!res.ok) {
        setVenueError(data.message || 'Failed to load venues');
        return;
      }

      setVenues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Venue fetch error:', error);
      setVenueError('Unable to load venues');
    } finally {
      setVenuesLoading(false);
    }
  };

  const fetchOwnerRequests = async () => {
    setOwnerRequestsLoading(true);
    setOwnerRequestMessage('');

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setOwnerRequestMessage('Admin token not found. Please login again.');
      setOwnerRequestsLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/owner-requests?status=pending'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setOwnerRequestMessage(getVenueErrorMessage(data, 'Failed to load owner requests'));
        return;
      }

      setOwnerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Owner request fetch error:', error);
      setOwnerRequestMessage(`Unable to load owner requests: ${error.message}`);
    } finally {
      setOwnerRequestsLoading(false);
    }
  };

  const fetchAdminBookings = async () => {
    setAdminBookingsLoading(true);
    setAdminBookingsMessage('');

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setAdminBookingsMessage('Admin token not found. Please login again.');
      setAdminBookingsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (bookingFilters.status) params.set('status', bookingFilters.status);
      if (bookingFilters.venueId) params.set('venueId', bookingFilters.venueId);
      if (bookingFilters.date) params.set('date', bookingFilters.date);

      const query = params.toString();
      const res = await fetch(apiUrl(`/api/bookings/admin${query ? `?${query}` : ''}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setAdminBookingsMessage(getVenueErrorMessage(data, 'Failed to load platform bookings'));
        return;
      }

      setAdminBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Admin bookings fetch error:', error);
      setAdminBookingsMessage(`Unable to load platform bookings: ${error.message}`);
    } finally {
      setAdminBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'venues') {
      fetchVenues();
    }
    if (activeSection === 'owner-requests') {
      fetchOwnerRequests();
    }
    if (activeSection === 'platform-bookings') {
      fetchAdminBookings();
      if (venues.length === 0) fetchVenues();
    }
  }, [activeSection]);

  const resetVenueForm = () => {
    setVenueForm(emptyVenueForm);
    setEditingVenueId(null);
    setVenueImageMessage('');
    setVenueImageUploading(false);
  };

  const handleVenueChange = (field, value) => {
    setVenueForm((current) => ({ ...current, [field]: value }));
  };

  const handleVenueImageUpload = async (file) => {
    setVenueImageMessage('');

    if (!file) return;

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setVenueImageMessage('Admin token not found. Please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setVenueImageUploading(true);

    try {
      const res = await fetch(apiUrl('/api/uploads/venue-image'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setVenueImageMessage(getVenueErrorMessage(data, 'Failed to upload image'));
        return;
      }

      setVenueForm((current) => ({ ...current, imageUrl: data.url || '' }));
      setVenueImageMessage('Image uploaded successfully.');
    } catch (error) {
      console.error('Venue image upload error:', error);
      setVenueImageMessage(`Unable to upload image: ${error.message}`);
    } finally {
      setVenueImageUploading(false);
    }
  };

  const handleSlotChange = (field, value) => {
    setSlotForm((current) => ({ ...current, [field]: value }));
  };

  const handleGenerateSlotsChange = (field, value) => {
    setGenerateSlotsForm((current) => ({ ...current, [field]: value }));
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    setSlotMessage('');

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setSlotMessage('Admin token not found. Please login again.');
      return;
    }

    setSlotLoading(true);

    try {
      const payload = {
        venueId: slotForm.venueId,
        date: slotForm.date,
        slotsData: [{
          startTime: slotForm.startTime,
          endTime: slotForm.endTime,
          price: Number(slotForm.price),
        }],
      };

      const res = await fetch(apiUrl('/api/slots'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setSlotMessage(getVenueErrorMessage(data, 'Failed to create slot'));
        return;
      }

      setSlotForm(emptySlotForm);
      setSlotMessage('Slot created successfully.');
    } catch (error) {
      console.error('Slot create error:', error);
      setSlotMessage(`Unable to create slot: ${error.message}`);
    } finally {
      setSlotLoading(false);
    }
  };

  const handleGenerateSlotsSubmit = async (e) => {
    e.preventDefault();
    setGenerateSlotsMessage('');
    setGenerateSlotsSummary(null);

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setGenerateSlotsMessage('Admin token not found. Please login again.');
      return;
    }

    setGenerateSlotsLoading(true);

    try {
      const payload = {
        venueId: generateSlotsForm.venueId,
        startDate: generateSlotsForm.startDate,
        days: Number(generateSlotsForm.days) || 30,
        openingTime: generateSlotsForm.openingTime,
        closingTime: generateSlotsForm.closingTime,
        slotDurationMinutes: Number(generateSlotsForm.slotDurationMinutes) || 60,
      };

      if (generateSlotsForm.price) {
        payload.price = Number(generateSlotsForm.price);
      }

      const res = await fetch(apiUrl('/api/slots/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setGenerateSlotsMessage(getVenueErrorMessage(data, 'Failed to generate slots'));
        return;
      }

      setGenerateSlotsSummary(data);
      setGenerateSlotsMessage('Monthly slots generated successfully.');
    } catch (error) {
      console.error('Slot generation error:', error);
      setGenerateSlotsMessage(`Unable to generate slots: ${error.message}`);
    } finally {
      setGenerateSlotsLoading(false);
    }
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    setVenueError('');

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setVenueError('Admin token not found. Please login again.');
      return;
    }

    const payload = {
      name: venueForm.name.trim(),
      sportTypes: toList(venueForm.sportTypes),
      location: venueForm.location.trim(),
      address: venueForm.address.trim(),
      pricePerHour: Number(venueForm.pricePerHour),
      amenities: toList(venueForm.amenities),
      description: venueForm.description.trim(),
      isActive: venueForm.isActive,
    };

    if (venueForm.imageUrl.trim()) {
      payload.images = [venueForm.imageUrl.trim()];
    }

    try {
      const venueUrl = editingVenueId ? apiUrl(`/api/venues/${editingVenueId}`) : apiUrl('/api/venues');
      const venueMethod = editingVenueId ? 'PUT' : 'POST';
      const res = await fetch(venueUrl, {
        method: venueMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await readResponseBody(res);

      console.log('[ADMIN VENUE SAVE]', {
        method: venueMethod,
        url: venueUrl,
        status: res.status,
        body: data,
        usesPlayNowToken: Boolean(token),
      });

      if (!res.ok) {
        setVenueError(getVenueErrorMessage(data, 'Failed to save venue'));
        return;
      }

      resetVenueForm();
      fetchVenues();
    } catch (error) {
      console.error('Venue save error:', error);
      setVenueError(`Unable to save venue: ${error.message}`);
    }
  };

  const handleEditVenue = (venue) => {
    setEditingVenueId(venue._id);
    setVenueImageMessage('');
    setVenueImageUploading(false);
    setVenueForm({
      name: venue.name || '',
      sportTypes: (venue.sportTypes || []).join(', '),
      location: venue.location || '',
      address: venue.address || '',
      pricePerHour: venue.pricePerHour || '',
      amenities: (venue.amenities || []).join(', '),
      description: venue.description || '',
      imageUrl: venue.images?.[0] || '',
      isActive: venue.isActive !== false,
    });
  };

  const handleDeleteVenue = async (venue) => {
    if (!window.confirm(`Delete ${venue.name}?`)) return;

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setVenueError('Admin token not found. Please login again.');
      return;
    }

    try {
      const venueUrl = apiUrl(`/api/venues/${venue._id}`);
      const res = await fetch(venueUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      console.log('[ADMIN VENUE DELETE]', {
        method: 'DELETE',
        url: venueUrl,
        status: res.status,
        body: data,
        usesPlayNowToken: Boolean(token),
      });

      if (!res.ok) {
        setVenueError(getVenueErrorMessage(data, 'Failed to delete venue'));
        return;
      }

      if (editingVenueId === venue._id) {
        resetVenueForm();
      }
      fetchVenues();
    } catch (error) {
      console.error('Venue delete error:', error);
      setVenueError(`Unable to delete venue: ${error.message}`);
    }
  };

  const handleApproveOwnerRequest = async (requestId) => {
    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setOwnerRequestMessage('Admin token not found. Please login again.');
      return;
    }

    setOwnerRequestActionId(requestId);
    setOwnerRequestMessage('');

    try {
      const res = await fetch(apiUrl(`/api/owner-requests/${requestId}/approve`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setOwnerRequestMessage(getVenueErrorMessage(data, 'Failed to approve request'));
        return;
      }

      setOwnerRequests((current) => current.filter((request) => request._id !== requestId));
      setOwnerRequestMessage('Owner request approved. Venue and owner access created.');
    } catch (error) {
      console.error('Owner request approve error:', error);
      setOwnerRequestMessage(`Unable to approve request: ${error.message}`);
    } finally {
      setOwnerRequestActionId('');
    }
  };

  const handleRejectOwnerRequest = async (requestId) => {
    const reason = window.prompt('Reason for rejection?') || '';
    const token = localStorage.getItem('playnow_token');

    if (!token) {
      setOwnerRequestMessage('Admin token not found. Please login again.');
      return;
    }

    setOwnerRequestActionId(requestId);
    setOwnerRequestMessage('');

    try {
      const res = await fetch(apiUrl(`/api/owner-requests/${requestId}/reject`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setOwnerRequestMessage(getVenueErrorMessage(data, 'Failed to reject request'));
        return;
      }

      setOwnerRequests((current) => current.filter((request) => request._id !== requestId));
      setOwnerRequestMessage('Owner request rejected.');
    } catch (error) {
      console.error('Owner request reject error:', error);
      setOwnerRequestMessage(`Unable to reject request: ${error.message}`);
    } finally {
      setOwnerRequestActionId('');
    }
  };

  const handleBookingFilterChange = (field, value) => {
    setBookingFilters((current) => ({ ...current, [field]: value }));
  };

  const handleBookingCollectionMethodChange = (bookingId, method) => {
    setBookingCollectionMethods((current) => ({ ...current, [bookingId]: method }));
  };

  const handleCollectBookingBalance = async (booking) => {
    const bookingId = booking._id;
    const method = bookingCollectionMethods[bookingId] || 'cash';
    const token = localStorage.getItem('playnow_token');

    if (!token) {
      setAdminBookingsMessage('Admin token not found. Please login again.');
      return;
    }

    setBookingCollectionLoadingId(bookingId);
    setAdminBookingsMessage('');

    try {
      const res = await fetch(apiUrl(`/api/bookings/${bookingId}/collect-balance`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setAdminBookingsMessage(getVenueErrorMessage(data, 'Failed to collect balance'));
        return;
      }

      setAdminBookings((current) => current.map((item) => (
        item._id === bookingId ? data : item
      )));
      setAdminBookingsMessage('Balance marked as collected.');
    } catch (error) {
      console.error('Admin collect balance error:', error);
      setAdminBookingsMessage(`Unable to collect balance: ${error.message}`);
    } finally {
      setBookingCollectionLoadingId('');
    }
  };

  const navItems = [
    { id: 'owner-requests', label: 'Owner Requests', icon: Mail },
    { id: 'platform-bookings', label: 'Platform Bookings', icon: BarChart3 },
    { id: 'users', label: 'Manage Users', icon: Users, comingSoon: true },
    { id: 'venues', label: 'Manage Venues', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, comingSoon: true },
  ];

  const visibleAdminBookings = bookingFilters.paymentStatus
    ? adminBookings.filter((booking) => booking.paymentStatus === bookingFilters.paymentStatus)
    : adminBookings;

  const todayKey = new Date().toISOString().slice(0, 10);
  const bookingSummary = visibleAdminBookings.reduce((summary, booking) => {
    const createdKey = booking.createdAt ? new Date(booking.createdAt).toISOString().slice(0, 10) : '';

    summary.totalBookings += 1;
    summary.totalPaidAmount += Number(booking.paidAmount || 0);
    summary.pendingBalance += Number(booking.remainingAmount || 0);

    if (createdKey === todayKey) {
      summary.todayBookings += 1;
    }

    if (booking.bookingStatus === 'cancelled') {
      summary.cancelledBookings += 1;
    }

    return summary;
  }, {
    totalBookings: 0,
    todayBookings: 0,
    totalPaidAmount: 0,
    pendingBalance: 0,
    cancelledBookings: 0,
  });

  return (
    <div className="fixed inset-0 bg-[#0a0f1c] flex overflow-hidden z-[100]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-[120] h-full w-64 bg-[#151b2b] border-r border-gray-800 p-6 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <Shield className="text-[#39FF14]" size={24} />
            <span className="font-extrabold text-xl tracking-tighter">ADMIN PANEL</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSection === item.id ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label}
              {item.comingSoon && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] uppercase ${activeSection === item.id ? 'bg-black text-[#39FF14]' : 'bg-gray-800 text-gray-500'}`}>
                  Soon
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition"
          >
            <XCircle size={18} /> Logout Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#151b2b]">
          <div className="flex items-center gap-2">
            <Shield className="text-[#39FF14]" size={20} />
            <span className="font-bold text-sm tracking-tight">ADMIN PANEL</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-800 rounded-lg text-white"
          >
            <Menu size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold capitalize">{activeSection.replace('-', ' ')}</h2>
              <p className="text-gray-500 text-sm md:text-base">MVP Admin: Manage venues and slots</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" placeholder="Search..." className="w-full md:w-auto bg-[#151b2b] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#39FF14]" />
              </div>
              <button
                onClick={() => {
                  if (activeSection === 'venues') fetchVenues();
                  if (activeSection === 'owner-requests') fetchOwnerRequests();
                  if (activeSection === 'platform-bookings') fetchAdminBookings();
                }}
                className="bg-[#151b2b] border border-gray-800 p-2 rounded-xl text-gray-400 hover:text-white transition"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </header>

          {activeSection === 'owner-requests' && (
            <div className="space-y-6">
              {ownerRequestMessage && (
                <div className={`rounded-xl px-4 py-3 text-sm border ${ownerRequestMessage.toLowerCase().includes('failed') || ownerRequestMessage.toLowerCase().includes('unable') || ownerRequestMessage.toLowerCase().includes('not found') ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]'}`}>
                  {ownerRequestMessage}
                </div>
              )}

              {ownerRequestsLoading ? (
                <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-12 text-center">
                  <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">Loading owner requests...</h3>
                </div>
              ) : ownerRequests.length === 0 ? (
                <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-12 text-center">
                  <Mail size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">No pending owner requests</h3>
                  <p className="text-sm text-gray-500 mt-2">New partner submissions will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {ownerRequests.map((request) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={request._id} 
                      className="bg-[#151b2b] border border-gray-800 rounded-2xl p-4 md:p-6 flex flex-col xl:flex-row xl:items-start justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 size={20} className="md:text-[#39FF14]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-base md:text-lg text-white">{request.venueName}</h4>
                          <p className="text-sm text-gray-400 mt-1">{request.address}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs text-gray-500 mt-4">
                            <span><strong className="text-gray-300">Owner:</strong> {request.ownerName}</span>
                            <span><strong className="text-gray-300">Phone:</strong> {request.phone}</span>
                            <span><strong className="text-gray-300">Email:</strong> {request.email || 'Not provided'}</span>
                            <span><strong className="text-gray-300">Sports:</strong> {(request.sportTypes || []).join(', ') || 'Not provided'}</span>
                            <span><strong className="text-gray-300">Price:</strong> {request.pricePerHour ? `Rs ${request.pricePerHour}/hr` : 'Not provided'}</span>
                            <span><strong className="text-gray-300">Created:</strong> {formatRequestDate(request.createdAt || request.submittedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-3 xl:ml-0">
                        <button 
                          onClick={() => handleRejectOwnerRequest(request._id)}
                          disabled={ownerRequestActionId === request._id}
                          className="px-3 md:px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs md:text-sm font-bold hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ownerRequestActionId === request._id ? 'Working...' : 'Reject'}
                        </button>
                        <button 
                          onClick={() => handleApproveOwnerRequest(request._id)}
                          disabled={ownerRequestActionId === request._id}
                          className="px-3 md:px-4 py-2 bg-[#39FF14] text-black rounded-xl text-xs md:text-sm font-bold hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ownerRequestActionId === request._id ? 'Working...' : 'Approve'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'platform-bookings' && (
            <div className="space-y-6">
              <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Booking Status
                    </label>
                    <select
                      value={bookingFilters.status}
                      onChange={(e) => handleBookingFilterChange('status', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">All</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Payment Status
                    </label>
                    <select
                      value={bookingFilters.paymentStatus}
                      onChange={(e) => handleBookingFilterChange('paymentStatus', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="advance_paid">Advance Paid</option>
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Venue
                    </label>
                    <select
                      value={bookingFilters.venueId}
                      onChange={(e) => handleBookingFilterChange('venueId', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">All Venues</option>
                      {venues.map((venue) => (
                        <option key={venue._id} value={venue._id}>{venue.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Slot Date
                    </label>
                    <input
                      type="date"
                      value={bookingFilters.date}
                      onChange={(e) => handleBookingFilterChange('date', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={fetchAdminBookings}
                      disabled={adminBookingsLoading}
                      className="w-full bg-[#39FF14] text-black font-bold px-5 py-3 rounded-xl hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adminBookingsLoading ? 'Loading...' : 'Apply Filters'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {[
                  ['Total Bookings', bookingSummary.totalBookings],
                  ['Today Bookings', bookingSummary.todayBookings],
                  ['Total Paid', formatMoney(bookingSummary.totalPaidAmount)],
                  ['Pending Balance', formatMoney(bookingSummary.pendingBalance)],
                  ['Cancelled', bookingSummary.cancelledBookings],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#151b2b] border border-gray-800 rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{label}</p>
                    <p className="text-xl font-black text-white mt-2">{value}</p>
                  </div>
                ))}
              </div>

              {adminBookingsMessage && (
                <div className={`rounded-xl px-4 py-3 text-sm border ${adminBookingsMessage.toLowerCase().includes('collected') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                  {adminBookingsMessage}
                </div>
              )}

              <div className="bg-[#151b2b] border border-gray-800 rounded-3xl overflow-hidden">
                {adminBookingsLoading ? (
                  <div className="p-12 text-center text-gray-500 font-bold">Loading platform bookings...</div>
                ) : visibleAdminBookings.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-bold">No bookings found for the selected filters.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1100px]">
                      <thead className="bg-black/30 border-b border-gray-800">
                        <tr className="text-xs font-black uppercase tracking-widest text-gray-500">
                          <th className="p-4">Booking ID</th>
                          <th className="p-4">Player</th>
                          <th className="p-4">Venue</th>
                          <th className="p-4">Slot</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleAdminBookings.map((booking) => {
                          const bookingId = booking._id || booking.id;
                          const shouldCollect = canCollectBookingBalance(booking);

                          return (
                            <tr key={bookingId} className="border-b border-white/5 align-top hover:bg-white/5">
                              <td className="p-4 font-mono text-sm text-gray-400">
                                #{bookingId?.slice(-8).toUpperCase()}
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-white">{booking.userId?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500 mt-1">{booking.userId?.phone || 'Phone unavailable'}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-white">{booking.venueId?.name || 'Venue unavailable'}</p>
                                <p className="text-xs text-gray-500 mt-1">{booking.venueId?.location || 'Location unavailable'}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-gray-300">{formatSlotDate(booking.slotIds?.[0])}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatSlotTimes(booking.slotIds)}</p>
                              </td>
                              <td className="p-4 text-sm">
                                <p>Total: <span className="font-bold text-white">{formatMoney(booking.totalAmount)}</span></p>
                                <p>Paid: <span className="font-bold text-[#39FF14]">{formatMoney(booking.paidAmount)}</span></p>
                                <p>Balance: <span className="font-bold text-yellow-400">{formatMoney(booking.remainingAmount)}</span></p>
                              </td>
                              <td className="p-4">
                                <p className="text-xs font-black uppercase text-gray-300">{booking.bookingStatus || 'unknown'}</p>
                                <p className="text-xs text-gray-500 mt-1">{booking.paymentStatus || 'payment unknown'}</p>
                              </td>
                              <td className="p-4 text-right">
                                {shouldCollect ? (
                                  <div className="flex flex-col gap-2 items-end">
                                    <select
                                      value={bookingCollectionMethods[bookingId] || 'cash'}
                                      onChange={(e) => handleBookingCollectionMethodChange(bookingId, e.target.value)}
                                      className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39FF14]"
                                    >
                                      <option value="cash">Cash</option>
                                      <option value="upi">UPI</option>
                                      <option value="card">Card</option>
                                    </select>
                                    <button
                                      onClick={() => handleCollectBookingBalance(booking)}
                                      disabled={bookingCollectionLoadingId === bookingId}
                                      className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {bookingCollectionLoadingId === bookingId ? 'Collecting...' : 'Mark Balance Collected'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">No balance due</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'venues' && (
            <div className="space-y-6">
              <form
                onSubmit={handleVenueSubmit}
                className="bg-[#151b2b] border border-gray-800 rounded-3xl p-4 md:p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">
                      {editingVenueId ? 'Edit Venue' : 'Add Venue'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Use comma-separated values for sports and amenities.
                    </p>
                  </div>
                  {editingVenueId && (
                    <button
                      type="button"
                      onClick={resetVenueForm}
                      className="text-sm font-bold text-gray-400 hover:text-white"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {venueError && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {venueError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Name
                    </label>
                    <input
                      required
                      value={venueForm.name}
                      onChange={(e) => handleVenueChange('name', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Sport Types
                    </label>
                    <input
                      required
                      value={venueForm.sportTypes}
                      onChange={(e) => handleVenueChange('sportTypes', e.target.value)}
                      placeholder="Badminton, Football Turf"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Location
                    </label>
                    <input
                      required
                      value={venueForm.location}
                      onChange={(e) => handleVenueChange('location', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Price Per Hour
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={venueForm.pricePerHour}
                      onChange={(e) => handleVenueChange('pricePerHour', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Address
                    </label>
                    <textarea
                      required
                      value={venueForm.address}
                      onChange={(e) => handleVenueChange('address', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] min-h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Amenities
                    </label>
                    <input
                      value={venueForm.amenities}
                      onChange={(e) => handleVenueChange('amenities', e.target.value)}
                      placeholder="Parking, Washroom, Lights"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Image URL Optional
                    </label>
                    <input
                      value={venueForm.imageUrl}
                      onChange={(e) => handleVenueChange('imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Upload Venue Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={venueImageUploading}
                      onChange={(e) => handleVenueImageUpload(e.target.files?.[0])}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-[#39FF14] file:px-4 file:py-2 file:font-bold file:text-black disabled:opacity-60"
                    />
                    {venueImageMessage && (
                      <p className={`mt-2 text-xs font-bold ${venueImageMessage.toLowerCase().includes('success') ? 'text-[#39FF14]' : 'text-red-400'}`}>
                        {venueImageMessage}
                      </p>
                    )}
                    {venueImageUploading && (
                      <p className="mt-2 text-xs font-bold text-gray-400">Uploading image...</p>
                    )}
                  </div>

                  {venueForm.imageUrl && (
                    <div className="md:col-span-2 bg-[#0a0f1c] border border-gray-800 rounded-2xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Image Preview</p>
                      <img
                        src={venueForm.imageUrl}
                        alt="Venue preview"
                        className="w-full max-h-64 object-cover rounded-xl border border-gray-800"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Description
                    </label>
                    <textarea
                      value={venueForm.description}
                      onChange={(e) => handleVenueChange('description', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] min-h-20"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={venueForm.isActive}
                      onChange={(e) => handleVenueChange('isActive', e.target.checked)}
                      className="w-4 h-4 accent-[#39FF14]"
                    />
                    Venue is active
                  </label>
                  <button
                    type="submit"
                    disabled={venueImageUploading}
                    className="bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {venueImageUploading ? 'Uploading Image...' : editingVenueId ? 'Update Venue' : 'Create Venue'}
                  </button>
                </div>
              </form>

              <div className="bg-[#151b2b] border border-gray-800 rounded-3xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Venue List</h3>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {venues.length} total
                  </span>
                </div>

                {venuesLoading ? (
                  <div className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Loading venues...
                  </div>
                ) : venues.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    No venues found. Create the first venue above.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {venues.map((venue) => (
                      <div key={venue._id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg truncate">{venue.name}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${venue.isActive ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-red-500/10 text-red-400'}`}>
                              {venue.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{venue.location}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(venue.sportTypes || []).join(', ') || 'No sports'} | Rs {venue.pricePerHour}/hr
                          </p>
                          {venue.ownerId?.name && (
                            <p className="text-xs text-gray-600 mt-1">Owner: {venue.ownerId.name}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditVenue(venue)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVenue(venue)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSlotSubmit}
                className="bg-[#151b2b] border border-gray-800 rounded-3xl p-4 md:p-6 space-y-4"
              >
                <div>
                  <h3 className="text-xl font-bold">Create Slots</h3>
                  <p className="text-sm text-gray-500">
                    Add playable slots for an existing venue.
                  </p>
                </div>

                {slotMessage && (
                  <div className={`rounded-xl px-4 py-3 text-sm border ${slotMessage.toLowerCase().includes('success') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                    {slotMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Venue
                    </label>
                    <select
                      required
                      value={slotForm.venueId}
                      onChange={(e) => handleSlotChange('venueId', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">Select venue</option>
                      {venues.map((venue) => (
                        <option key={venue._id} value={venue._id}>
                          {venue.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Date
                    </label>
                    <input
                      required
                      type="date"
                      value={slotForm.date}
                      onChange={(e) => handleSlotChange('date', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Start Time
                    </label>
                    <input
                      required
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => handleSlotChange('startTime', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      End Time
                    </label>
                    <input
                      required
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => handleSlotChange('endTime', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Price
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={slotForm.price}
                      onChange={(e) => handleSlotChange('price', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={slotLoading || venues.length === 0}
                      className="w-full bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {slotLoading ? 'Creating Slot...' : 'Create Slot'}
                    </button>
                  </div>
                </div>
              </form>

              <form
                onSubmit={handleGenerateSlotsSubmit}
                className="bg-[#151b2b] border border-gray-800 rounded-3xl p-4 md:p-6 space-y-4"
              >
                <div>
                  <h3 className="text-xl font-bold">Generate Monthly Slots</h3>
                  <p className="text-sm text-gray-500">
                    Generate hourly slots for the next 30 days.
                  </p>
                </div>

                {generateSlotsMessage && (
                  <div className={`rounded-xl px-4 py-3 text-sm border ${generateSlotsMessage.toLowerCase().includes('success') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                    {generateSlotsMessage}
                  </div>
                )}

                {generateSlotsSummary && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Created</p>
                      <p className="text-2xl font-black text-[#39FF14]">{generateSlotsSummary.createdSlots || 0}</p>
                    </div>
                    <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Existing</p>
                      <p className="text-2xl font-black text-white">{generateSlotsSummary.existingSlots || 0}</p>
                    </div>
                    <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Requested</p>
                      <p className="text-2xl font-black text-white">{generateSlotsSummary.requestedSlots || 0}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Venue
                    </label>
                    <select
                      required
                      value={generateSlotsForm.venueId}
                      onChange={(e) => handleGenerateSlotsChange('venueId', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">Select venue</option>
                      {venues.map((venue) => (
                        <option key={venue._id} value={venue._id}>
                          {venue.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Start Date
                    </label>
                    <input
                      required
                      type="date"
                      value={generateSlotsForm.startDate}
                      onChange={(e) => handleGenerateSlotsChange('startDate', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Days
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={generateSlotsForm.days}
                      onChange={(e) => handleGenerateSlotsChange('days', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Opening Time
                    </label>
                    <input
                      required
                      type="time"
                      value={generateSlotsForm.openingTime}
                      onChange={(e) => handleGenerateSlotsChange('openingTime', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Closing Time
                    </label>
                    <input
                      required
                      type="time"
                      value={generateSlotsForm.closingTime}
                      onChange={(e) => handleGenerateSlotsChange('closingTime', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Slot Duration
                    </label>
                    <input
                      required
                      type="number"
                      min="15"
                      step="15"
                      value={generateSlotsForm.slotDurationMinutes}
                      onChange={(e) => handleGenerateSlotsChange('slotDurationMinutes', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Price Optional
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={generateSlotsForm.price}
                      onChange={(e) => handleGenerateSlotsChange('price', e.target.value)}
                      placeholder="Venue price"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={generateSlotsLoading || venues.length === 0}
                    className="w-full sm:w-auto bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#32E612] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generateSlotsLoading ? 'Generating Slots...' : 'Generate Monthly Slots'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection !== 'owner-requests' && activeSection !== 'platform-bookings' && activeSection !== 'venues' && (
            <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-8 md:p-12 text-center opacity-50">
              <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Coming Soon</h3>
              <p className="text-gray-500 mt-2 text-sm">This admin section is not part of the MVP. Use Manage Venues for venues and slots.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
