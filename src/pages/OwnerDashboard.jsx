import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Calendar, Clock, DollarSign, MapPin, RefreshCw, Settings, Users } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const emptySummary = {
  totalBookings: 0,
  todayBookings: 0,
  upcomingBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
  todayRevenue: 0,
};

const todayInput = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatTime = (time) => {
  if (!time) return '';
  const [hourValue, minute = '00'] = time.split(':');
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${period}`;
};

const formatDate = (date) => {
  if (!date) return 'Date unavailable';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatSlotRange = (slot) => (
  [formatTime(slot?.startTime), formatTime(slot?.endTime)].filter(Boolean).join(' - ') || 'Time unavailable'
);

const getBookingId = (booking) => booking?._id || booking?.id;

const canCollectBalance = (booking) => (
  Number(booking?.remainingAmount || 0) > 0 &&
  booking?.bookingStatus !== 'cancelled' &&
  booking?.paymentStatus !== 'completed'
);

const emptyVenueSettings = {
  venueId: '',
  pricePerHour: '',
  description: '',
  isActive: true,
  contacts: {
    owner: { name: '', phone: '', email: '' },
    manager: { name: '', phone: '', email: '' },
    incharge: { name: '', phone: '', email: '' },
  },
};

const OwnerDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('venues');
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState('');

  const [collectionMethods, setCollectionMethods] = useState({});
  const [collectionLoadingId, setCollectionLoadingId] = useState('');
  const [collectionMessage, setCollectionMessage] = useState('');

  const [slotFilters, setSlotFilters] = useState({
    venueId: '',
    date: todayInput(),
    status: '',
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotMessage, setSlotMessage] = useState('');
  const [slotUpdatingId, setSlotUpdatingId] = useState('');

  const [generateForm, setGenerateForm] = useState({
    venueId: '',
    startDate: todayInput(),
    days: '30',
    openingTime: '06:00',
    closingTime: '23:00',
    slotDurationMinutes: '60',
    price: '',
  });
  const [generateMessage, setGenerateMessage] = useState('');
  const [generateSummary, setGenerateSummary] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);

  const [venueSettings, setVenueSettings] = useState(emptyVenueSettings);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  const token = () => localStorage.getItem('playnow_token');

  const authHeaders = () => {
    const savedToken = token();
    return savedToken ? { Authorization: `Bearer ${savedToken}` } : {};
  };

  const readBody = async (res) => {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setPageMessage('');

    try {
      const headers = authHeaders();
      const [venuesRes, bookingsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/venues/my`, { headers }),
        fetch(`${API_BASE_URL}/api/bookings/owner`, { headers }),
        fetch(`${API_BASE_URL}/api/bookings/owner/summary`, { headers }),
      ]);

      const venuesData = await readBody(venuesRes);
      const bookingsData = await readBody(bookingsRes);
      const summaryData = await readBody(summaryRes);

      if (!venuesRes.ok || !bookingsRes.ok || !summaryRes.ok) {
        setPageMessage(venuesData.message || bookingsData.message || summaryData.message || 'Unable to load owner dashboard');
        return;
      }

      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setSummary({ ...emptySummary, ...summaryData });
    } catch (error) {
      console.error('Owner dashboard load error:', error);
      setPageMessage('Unable to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!venues.length) return;
    const firstVenueId = venues[0]._id;

    setSlotFilters((current) => ({ ...current, venueId: current.venueId || firstVenueId }));
    setGenerateForm((current) => ({ ...current, venueId: current.venueId || firstVenueId }));
    setVenueSettings((current) => {
      if (current.venueId) return current;
      return buildVenueSettings(venues[0]);
    });
  }, [venues]);

  const pendingBalanceBookings = useMemo(
    () => bookings.filter(canCollectBalance),
    [bookings]
  );

  const buildQuery = (filters) => {
    const params = new URLSearchParams();
    if (filters.venueId) params.set('venueId', filters.venueId);
    if (filters.date) params.set('date', filters.date);
    if (filters.status) params.set('status', filters.status);
    const query = params.toString();
    return query ? `?${query}` : '';
  };

  const fetchManagedSlots = async () => {
    setSlotsLoading(true);
    setSlotMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/manage${buildQuery(slotFilters)}`, {
        headers: authHeaders(),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setSlotMessage(data.message || 'Unable to load slots');
        return;
      }

      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Manage slots load error:', error);
      setSlotMessage('Unable to load slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'slots' && slotFilters.venueId) {
      fetchManagedSlots();
    }
  }, [activeTab, slotFilters.venueId, slotFilters.date, slotFilters.status]);

  const handleCollectionMethodChange = (bookingId, method) => {
    setCollectionMethods((current) => ({ ...current, [bookingId]: method }));
  };

  const handleCollectBalance = async (booking) => {
    const bookingId = getBookingId(booking);
    const method = collectionMethods[bookingId] || 'cash';
    setCollectionMessage('');
    setCollectionLoadingId(bookingId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/collect-balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ method }),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setCollectionMessage(data.message || 'Unable to collect balance');
        return;
      }

      setBookings((current) => current.map((item) => (
        getBookingId(item) === bookingId ? data : item
      )));
      setCollectionMessage('Balance marked as collected.');
      loadDashboard();
    } catch (error) {
      console.error('Collect balance error:', error);
      setCollectionMessage('Unable to collect balance. Please try again.');
    } finally {
      setCollectionLoadingId('');
    }
  };

  const handleSlotStatusUpdate = async (slot, status) => {
    if (slot.status === 'booked' || slot.status === 'locked') {
      setSlotMessage(`Cannot change a ${slot.status} slot from owner dashboard.`);
      return;
    }

    setSlotUpdatingId(slot._id);
    setSlotMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/${slot._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setSlotMessage(data.message || 'Unable to update slot');
        return;
      }

      setSlots((current) => current.map((item) => (
        item._id === slot._id ? { ...item, status: data.status || status } : item
      )));
      setSlotMessage('Slot status updated.');
    } catch (error) {
      console.error('Slot update error:', error);
      setSlotMessage('Unable to update slot. Please try again.');
    } finally {
      setSlotUpdatingId('');
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    setGenerateMessage('');
    setGenerateSummary(null);
    setGenerateLoading(true);

    try {
      const payload = {
        venueId: generateForm.venueId,
        startDate: generateForm.startDate,
        days: Number(generateForm.days) || 30,
        openingTime: generateForm.openingTime,
        closingTime: generateForm.closingTime,
        slotDurationMinutes: Number(generateForm.slotDurationMinutes) || 60,
      };

      if (generateForm.price) {
        payload.price = Number(generateForm.price);
      }

      const res = await fetch(`${API_BASE_URL}/api/slots/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setGenerateMessage(data.message || 'Unable to generate slots');
        return;
      }

      setGenerateSummary(data);
      setGenerateMessage('Slots generated successfully.');
      if (activeTab === 'slots') fetchManagedSlots();
    } catch (error) {
      console.error('Generate slots error:', error);
      setGenerateMessage('Unable to generate slots. Please try again.');
    } finally {
      setGenerateLoading(false);
    }
  };

  function buildVenueSettings(venue) {
    return {
      venueId: venue?._id || '',
      pricePerHour: venue?.pricePerHour || '',
      description: venue?.description || '',
      isActive: venue?.isActive !== false,
      contacts: {
        owner: {
          name: venue?.contacts?.owner?.name || '',
          phone: venue?.contacts?.owner?.phone || '',
          email: venue?.contacts?.owner?.email || '',
        },
        manager: {
          name: venue?.contacts?.manager?.name || '',
          phone: venue?.contacts?.manager?.phone || '',
          email: venue?.contacts?.manager?.email || '',
        },
        incharge: {
          name: venue?.contacts?.incharge?.name || '',
          phone: venue?.contacts?.incharge?.phone || '',
          email: venue?.contacts?.incharge?.email || '',
        },
      },
    };
  }

  const handleVenueSettingsVenueChange = (venueId) => {
    const venue = venues.find((item) => item._id === venueId);
    setSettingsMessage('');
    setVenueSettings(buildVenueSettings(venue));
  };

  const handleContactChange = (role, field, value) => {
    setVenueSettings((current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        [role]: {
          ...current.contacts[role],
          [field]: value,
        },
      },
    }));
  };

  const handleSaveVenueSettings = async (e) => {
    e.preventDefault();
    setSettingsMessage('');
    setSettingsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/venues/${venueSettings.venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          pricePerHour: Number(venueSettings.pricePerHour),
          description: venueSettings.description,
          isActive: venueSettings.isActive,
          contacts: venueSettings.contacts,
        }),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setSettingsMessage(data.message || 'Unable to save venue settings');
        return;
      }

      setVenues((current) => current.map((venue) => (
        venue._id === data._id ? data : venue
      )));
      setVenueSettings(buildVenueSettings(data));
      setSettingsMessage('Venue settings saved.');
    } catch (error) {
      console.error('Venue settings save error:', error);
      setSettingsMessage('Unable to save venue settings. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const renderBookingList = (items, includeCollectAction = false) => (
    <div className="bg-[#151b2b] rounded-2xl border border-gray-800 overflow-hidden">
      {items.length === 0 ? (
        <div className="p-10 text-center text-gray-500 font-bold">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/30 text-gray-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="p-4">Booking</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Player</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                {includeCollectAction && <th className="p-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((booking) => {
                const bookingId = getBookingId(booking);
                return (
                  <tr key={bookingId} className="border-t border-white/5 align-top">
                    <td className="p-4 font-mono text-sm text-gray-400">{bookingId?.slice(-8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{booking.venueId?.name || 'Venue unavailable'}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.venueId?.location || 'Location unavailable'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{booking.userId?.name || 'Guest'}</p>
                      {booking.userId?.phone && <p className="text-xs text-gray-500 mt-1">{booking.userId.phone}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-300">{formatDate(booking.slotIds?.[0]?.date)}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.slotIds?.map(formatSlotRange).join(', ') || 'Time unavailable'}</p>
                    </td>
                    <td className="p-4 text-sm">
                      <p>Total: <span className="font-bold text-white">{formatCurrency(booking.totalAmount)}</span></p>
                      <p>Paid: <span className="font-bold text-[#39FF14]">{formatCurrency(booking.paidAmount)}</span></p>
                      <p>Balance: <span className="font-bold text-yellow-400">{formatCurrency(booking.remainingAmount)}</span></p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black uppercase text-gray-300">{booking.bookingStatus || 'unknown'}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.paymentStatus || 'payment unknown'}</p>
                    </td>
                    {includeCollectAction && (
                      <td className="p-4 text-right">
                        {canCollectBalance(booking) ? (
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            <select
                              value={collectionMethods[bookingId] || 'cash'}
                              onChange={(e) => handleCollectionMethodChange(bookingId, e.target.value)}
                              className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm"
                            >
                              <option value="cash">Cash</option>
                              <option value="upi">UPI</option>
                              <option value="card">Card</option>
                            </select>
                            <button
                              onClick={() => handleCollectBalance(booking)}
                              disabled={collectionLoadingId === bookingId}
                              className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50"
                            >
                              {collectionLoadingId === bookingId ? 'Collecting...' : 'Mark Balance Collected'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-bold uppercase">No balance due</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-400">Manage venues, bookings, slots, and balances.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadDashboard}
            className="bg-[#151b2b] border border-gray-800 px-4 py-2 rounded-xl text-gray-300 hover:text-white transition flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={logout} className="bg-red-500/10 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition font-medium">
            Logout
          </button>
        </div>
      </div>

      {pageMessage && (
        <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
          {pageMessage}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
        {[
          ['Total Bookings', summary.totalBookings],
          ['Today', summary.todayBookings],
          ['Upcoming', summary.upcomingBookings],
          ['Cancelled', summary.cancelledBookings],
          ['Total Revenue', formatCurrency(summary.totalRevenue)],
          ['Today Revenue', formatCurrency(summary.todayRevenue)],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#151b2b] border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{label}</p>
            <p className="text-xl font-black text-white mt-2">{loading ? '...' : value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
        {[
          ['venues', 'My Venues'],
          ['bookings', 'My Bookings'],
          ['pending-balance', 'Pending Balance'],
          ['slots', 'Manage Slots'],
          ['generate-slots', 'Generate Slots'],
          ['settings', 'Venue Settings'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap px-5 py-3 rounded-xl font-bold transition ${activeTab === id ? 'bg-[#39FF14] text-black' : 'bg-[#151b2b] text-gray-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'venues' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {venues.length === 0 ? (
            <div className="md:col-span-2 bg-[#151b2b] border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
              No venues assigned to this owner yet.
            </div>
          ) : venues.map((venue) => (
            <div key={venue._id} className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">{venue.name}</h2>
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-2"><MapPin size={14} /> {venue.location}</p>
                </div>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${venue.isActive !== false ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-red-500/10 text-red-400'}`}>
                  {venue.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs uppercase font-bold">Price</p>
                  <p className="font-black text-white mt-1">{formatCurrency(venue.pricePerHour)}/hr</p>
                </div>
                <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs uppercase font-bold">Sports</p>
                  <p className="font-black text-white mt-1">{(venue.sportTypes || []).join(', ') || 'Not set'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">{venue.description}</p>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'bookings' && renderBookingList(bookings)}

      {activeTab === 'pending-balance' && (
        <section className="space-y-4">
          {collectionMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${collectionMessage.toLowerCase().includes('collected') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
              {collectionMessage}
            </div>
          )}
          {renderBookingList(pendingBalanceBookings, true)}
        </section>
      )}

      {activeTab === 'slots' && (
        <section className="bg-[#151b2b] border border-gray-800 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Venue</label>
              <select
                value={slotFilters.venueId}
                onChange={(e) => setSlotFilters((current) => ({ ...current, venueId: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                {venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
              <input
                type="date"
                value={slotFilters.date}
                onChange={(e) => setSlotFilters((current) => ({ ...current, date: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
              <select
                value={slotFilters.status}
                onChange={(e) => setSlotFilters((current) => ({ ...current, status: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="blocked">Blocked</option>
                <option value="booked">Booked</option>
                <option value="locked">Locked</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchManagedSlots}
                className="w-full bg-[#39FF14] text-black font-bold px-4 py-3 rounded-xl"
              >
                Load Slots
              </button>
            </div>
          </div>

          {slotMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${slotMessage.toLowerCase().includes('updated') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
              {slotMessage}
            </div>
          )}

          {slotsLoading ? (
            <div className="p-10 text-center text-gray-500">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No slots found for the selected filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const isLockedStatus = slot.status === 'booked' || slot.status === 'locked';
                return (
                  <div key={slot._id} className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{formatDate(slot.date)}</p>
                        <p className="text-sm text-gray-400 mt-1">{formatSlotRange(slot)}</p>
                      </div>
                      <span className="text-xs uppercase font-black text-gray-400">{slot.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">{formatCurrency(slot.price)}</p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        disabled={isLockedStatus || slotUpdatingId === slot._id || slot.status === 'available'}
                        onClick={() => handleSlotStatusUpdate(slot, 'available')}
                        className="bg-[#39FF14]/10 text-[#39FF14] font-bold rounded-xl py-2 disabled:opacity-40"
                      >
                        Available
                      </button>
                      <button
                        disabled={isLockedStatus || slotUpdatingId === slot._id || slot.status === 'blocked'}
                        onClick={() => handleSlotStatusUpdate(slot, 'blocked')}
                        className="bg-red-500/10 text-red-400 font-bold rounded-xl py-2 disabled:opacity-40"
                      >
                        Block
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'generate-slots' && (
        <form onSubmit={handleGenerateSlots} className="bg-[#151b2b] border border-gray-800 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Venue</label>
              <select
                required
                value={generateForm.venueId}
                onChange={(e) => setGenerateForm((current) => ({ ...current, venueId: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                {venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
              </select>
            </div>
            {[
              ['startDate', 'Start Date', 'date'],
              ['days', 'Days', 'number'],
              ['openingTime', 'Opening Time', 'time'],
              ['closingTime', 'Closing Time', 'time'],
              ['slotDurationMinutes', 'Duration Minutes', 'number'],
              ['price', 'Price Optional', 'number'],
            ].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
                <input
                  type={type}
                  min={type === 'number' ? '1' : undefined}
                  value={generateForm[field]}
                  onChange={(e) => setGenerateForm((current) => ({ ...current, [field]: e.target.value }))}
                  className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]"
                  required={field !== 'price'}
                />
              </div>
            ))}
          </div>

          {generateMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${generateMessage.toLowerCase().includes('success') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
              {generateMessage}
            </div>
          )}

          {generateSummary && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold">Created</p>
                <p className="text-xl font-black text-white">{generateSummary.createdSlots || 0}</p>
              </div>
              <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold">Existing</p>
                <p className="text-xl font-black text-white">{generateSummary.existingSlots || 0}</p>
              </div>
              <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold">Requested</p>
                <p className="text-xl font-black text-white">{generateSummary.requestedSlots || 0}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={generateLoading || venues.length === 0}
            className="w-full md:w-auto bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {generateLoading ? 'Generating...' : 'Generate Slots'}
          </button>
        </form>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveVenueSettings} className="bg-[#151b2b] border border-gray-800 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Venue</label>
              <select
                value={venueSettings.venueId}
                onChange={(e) => handleVenueSettingsVenueChange(e.target.value)}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                {venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price Per Hour</label>
              <input
                type="number"
                min="1"
                required
                value={venueSettings.pricePerHour}
                onChange={(e) => setVenueSettings((current) => ({ ...current, pricePerHour: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <label className="flex items-center gap-3 bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 mt-0 md:mt-6">
              <input
                type="checkbox"
                checked={venueSettings.isActive}
                onChange={(e) => setVenueSettings((current) => ({ ...current, isActive: e.target.checked }))}
              />
              <span className="font-bold text-white">Venue Active</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
            <textarea
              value={venueSettings.description}
              onChange={(e) => setVenueSettings((current) => ({ ...current, description: e.target.value }))}
              className="w-full min-h-28 bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {['owner', 'manager', 'incharge'].map((role) => (
            <div key={role} className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
              <h3 className="font-black text-white capitalize mb-3">{role} Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['name', 'phone', 'email'].map((field) => (
                  <input
                    key={field}
                    type={field === 'email' ? 'email' : 'text'}
                    placeholder={field}
                    value={venueSettings.contacts[role][field]}
                    onChange={(e) => handleContactChange(role, field, e.target.value)}
                    className="bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white"
                  />
                ))}
              </div>
            </div>
          ))}

          {settingsMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${settingsMessage.toLowerCase().includes('saved') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
              {settingsMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={settingsLoading || !venueSettings.venueId}
            className="w-full md:w-auto bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {settingsLoading ? 'Saving...' : 'Save Venue Settings'}
          </button>
        </form>
      )}
    </div>
  );
};

export default OwnerDashboard;
