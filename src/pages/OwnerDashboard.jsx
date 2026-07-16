import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, RefreshCw, BarChart3, CalendarDays, Wallet, TrendingUp } from 'lucide-react';
import { formatSportTypes } from '../utils/sports';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const todayInput = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatTime = (time) => {
  if (!time) return '';
  const [hourValue, minute = '00'] = time.split(':');
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${period}`;
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  const value = `${String(hour).padStart(2, '0')}:${minute}`;
  return { value, label: formatTime(value) };
});

const TimeSelect = ({ value, onChange, required = true }) => (
  <select
    required={required}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
  >
    <option value="">Select time</option>
    {timeOptions.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

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

const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' â€¢ ') || venue?.location || 'Location unavailable'
);

const emptyCourtGroup = {
  courtCode: '',
  name: '',
  sports: '',
  courtCount: '1',
  pricePerHour: '',
  courtType: 'Standard',
  dependencyGroup: '',
  bookingMode: 'independent',
  isActive: true,
};

const emptyRecurringBlockForm = {
  venueId: '',
  courtCode: '',
  daysOfWeek: [],
  startTime: '',
  endTime: '',
  startDate: todayInput(),
  endDate: '',
  reason: '',
  isActive: true,
};

const dayOptions = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const toList = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
const formatCourtGroupSports = (sports = []) => formatSportTypes(sports);
const getVenueCourtGroups = (venue) => (
  Array.isArray(venue?.courtGroups) && venue.courtGroups.length > 0
    ? venue.courtGroups
    : [{ courtCode: 'legacy', name: 'Main Court', sports: venue?.sportTypes || [], courtCount: 1, pricePerHour: venue?.pricePerHour, courtType: 'Standard', dependencyGroup: '', bookingMode: 'independent', isActive: true }]
);
const normalizeCourtGroupsForForm = (courtGroups = []) => (
  Array.isArray(courtGroups) && courtGroups.length > 0
    ? courtGroups.map((group) => ({
      courtCode: group.courtCode || '',
      name: group.name || '',
      sports: formatCourtGroupSports(group.sports),
      courtCount: String(group.courtCount || 1),
      pricePerHour: group.pricePerHour ?? '',
      courtType: group.courtType || 'Standard',
      dependencyGroup: group.dependencyGroup || '',
      bookingMode: group.bookingMode || 'independent',
      isActive: group.isActive !== false,
    }))
    : [{ ...emptyCourtGroup }]
);
const serializeCourtGroups = (courtGroups = []) => (
  courtGroups
    .map((group) => ({
      courtCode: group.courtCode || undefined,
      name: group.name.trim(),
      sports: toList(group.sports),
      courtCount: Number(group.courtCount) || 1,
      pricePerHour: Number(group.pricePerHour) || 0,
      courtType: group.courtType.trim() || 'Standard',
      dependencyGroup: group.dependencyGroup?.trim() || '',
      bookingMode: group.bookingMode || 'independent',
      isActive: group.isActive !== false,
    }))
    .filter((group) => group.name && group.sports.length > 0 && group.pricePerHour > 0)
);

const getBookingId = (booking) => booking?._id || booking?.id;
const getBookingDisplayId = (booking) => booking?.bookingCode || getBookingId(booking)?.slice(-8).toUpperCase();

const canCollectBalance = (booking) => (
  Number(booking?.remainingAmount || 0) > 0 &&
  booking?.bookingStatus !== 'cancelled' &&
  booking?.paymentStatus !== 'completed'
);

const formatRuleDays = (days = []) => dayOptions
  .filter((day) => days.includes(day.value))
  .map((day) => day.label)
  .join(', ') || 'No days';

const emptyVenueSettings = {
  venueId: '',
  pricePerHour: '',
  description: '',
  isActive: true,
  contacts: {
    owner: { name: '', phone: '', email: '' },
    incharge: { name: '', phone: '', email: '', whatsapp: '' },
  },
  courtGroups: [{ ...emptyCourtGroup }],
};

const KpiCard = ({ title, value, icon, description }) => (
  <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-[#0a0f1c] rounded-lg text-[#39FF14]">{icon}</div>
      <h3 className="text-sm font-bold text-gray-400">{title}</h3>
    </div>
    <p className="text-3xl font-black text-white">{value}</p>
    {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
  </div>
);

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('venues');
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState('');
  const [bookingFilters, setBookingFilters] = useState({
    search: '',
    status: '',
  });

  const [collectionMethods, setCollectionMethods] = useState({});
  const [collectionLoadingId, setCollectionLoadingId] = useState('');
  const [collectionMessage, setCollectionMessage] = useState('');

  const [slotFilters, setSlotFilters] = useState({
    venueId: '',
    courtCode: '',
    date: todayInput(),
    status: '',
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotMessage, setSlotMessage] = useState('');
  const [slotUpdatingId, setSlotUpdatingId] = useState('');
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);

  const [generateForm, setGenerateForm] = useState({
    venueId: '',
    courtCode: '',
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

  const [recurringRules, setRecurringRules] = useState([]);
  const [recurringRuleForm, setRecurringRuleForm] = useState(emptyRecurringBlockForm);
  const [editingRuleId, setEditingRuleId] = useState('');
  const [recurringRulesLoading, setRecurringRulesLoading] = useState(false);
  const [recurringRuleMessage, setRecurringRuleMessage] = useState('');

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
      const [venuesRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/venues/my`, { headers }),
        fetch(`${API_BASE_URL}/api/bookings/owner`, { headers }),
      ]);

      const venuesData = await readBody(venuesRes);
      const bookingsData = await readBody(bookingsRes);

      if (!venuesRes.ok || !bookingsRes.ok) {
        setPageMessage(venuesData.message || bookingsData.message || 'Unable to load owner dashboard');
        return;
      }

      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
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
    setRecurringRuleForm((current) => ({ ...current, venueId: current.venueId || firstVenueId }));
    setVenueSettings((current) => {
      if (current.venueId) return current;
      return buildVenueSettings(venues[0]);
    });
  }, [venues]);

  const pendingBalanceBookings = useMemo(
    () => bookings.filter(canCollectBalance),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    const search = bookingFilters.search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = !bookingFilters.status || booking.bookingStatus === bookingFilters.status;
      const searchable = [
        booking._id,
        booking.bookingCode,
        booking.userId?.name,
        booking.userId?.phone,
        booking.venueId?.name,
        formatVenueLocation(booking.venueId),
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesStatus && (!search || searchable.includes(search));
    });
  }, [bookings, bookingFilters]);

  const revenueSummary = useMemo(() => {
    const today = todayInput();
    const now = new Date();

    return bookings.reduce((stats, booking) => {
      const bookingCreatedToday = booking.createdAt && new Date(booking.createdAt).toISOString().slice(0, 10) === today;
      const hasFutureSlot = (booking.slotIds || []).some((slot) => {
        if (!slot?.date || !slot?.startTime) return false;
        const slotDate = new Date(slot.date);
        const [hours, minutes = '0'] = slot.startTime.split(':').map(Number);
        if (Number.isNaN(slotDate.getTime()) || Number.isNaN(hours) || Number.isNaN(minutes)) return false;
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate > now;
      });

      stats.totalBookings += 1;
      if (bookingCreatedToday) stats.todayBookings += 1;
      if (booking.bookingStatus !== 'cancelled' && hasFutureSlot) stats.upcomingBookings += 1;
      if (booking.bookingStatus === 'cancelled') stats.cancelledBookings += 1;

      if (['confirmed', 'completed'].includes(booking.bookingStatus)) {
        stats.totalRevenue += Number(booking.paidAmount || 0);
        if (bookingCreatedToday) stats.todayRevenue += Number(booking.paidAmount || 0);
      }

      return stats;
    }, {
      totalBookings: 0,
      todayBookings: 0,
      upcomingBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      todayRevenue: 0,
    });
  }, [bookings]);

  const buildQuery = (filters) => {
    const params = new URLSearchParams();
    if (filters.venueId) params.set('venueId', filters.venueId);
    if (filters.courtCode) params.set('courtCode', filters.courtCode);
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
      setSelectedSlotIds([]);
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
  }, [activeTab, slotFilters.venueId, slotFilters.courtCode, slotFilters.date, slotFilters.status]);

  const fetchRecurringRules = async () => {
    setRecurringRulesLoading(true);
    setRecurringRuleMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/recurring-block-rules`, {
        headers: authHeaders(),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setRecurringRuleMessage(data.message || 'Unable to load recurring block rules');
        return;
      }

      setRecurringRules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Recurring block rules load error:', error);
      setRecurringRuleMessage('Unable to load recurring block rules. Please try again.');
    } finally {
      setRecurringRulesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recurring-blocks') {
      fetchRecurringRules();
    }
  }, [activeTab]);

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

  const toggleSlotSelection = (slot) => {
    if (slot.status === 'booked' || slot.status === 'locked') {
      setSlotMessage(`Cannot select a ${slot.status} slot.`);
      return;
    }

    setSelectedSlotIds((current) => (
      current.includes(slot._id)
        ? current.filter((id) => id !== slot._id)
        : [...current, slot._id]
    ));
  };

  const handleBulkSlotStatusUpdate = async (status) => {
    const selectedSlots = slots.filter((slot) => selectedSlotIds.includes(slot._id));
    const editableSlots = selectedSlots.filter((slot) => !['booked', 'locked'].includes(slot.status));

    if (!editableSlots.length) {
      setSlotMessage('Select at least one available or blocked slot.');
      return;
    }

    setSlotUpdatingId('bulk');
    setSlotMessage('');

    try {
      const results = await Promise.all(editableSlots.map(async (slot) => {
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
          throw new Error(data.message || `Unable to update ${formatSlotRange(slot)}`);
        }
        return data;
      }));

      const updatedById = new Map(results.map((slot) => [slot._id, slot]));
      setSlots((current) => current.map((slot) => (
        updatedById.has(slot._id) ? { ...slot, status: updatedById.get(slot._id).status || status } : slot
      )));
      setSelectedSlotIds([]);
      setSlotMessage(`${editableSlots.length} slot${editableSlots.length === 1 ? '' : 's'} ${status === 'blocked' ? 'blocked' : 'unblocked'}.`);
    } catch (error) {
      console.error('Bulk slot update error:', error);
      setSlotMessage(error.message || 'Unable to update selected slots.');
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
        courtCode: generateForm.courtCode,
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

  const handleRecurringRuleChange = (field, value) => {
    setRecurringRuleForm((current) => ({ ...current, [field]: value }));
  };

  const toggleRecurringRuleDay = (dayValue) => {
    setRecurringRuleForm((current) => ({
      ...current,
      daysOfWeek: current.daysOfWeek.includes(dayValue)
        ? current.daysOfWeek.filter((day) => day !== dayValue)
        : [...current.daysOfWeek, dayValue],
    }));
  };

  const resetRecurringRuleForm = () => {
    setRecurringRuleForm({
      ...emptyRecurringBlockForm,
      venueId: venues[0]?._id || '',
    });
    setEditingRuleId('');
  };

  const handleEditRecurringRule = (rule) => {
    setEditingRuleId(rule._id);
    setRecurringRuleForm({
      venueId: rule.venueId?._id || rule.venueId || '',
      courtCode: rule.courtCode || '',
      daysOfWeek: rule.daysOfWeek || [],
      startTime: rule.startTime || '',
      endTime: rule.endTime || '',
      startDate: rule.startDate ? rule.startDate.slice(0, 10) : todayInput(),
      endDate: rule.endDate ? rule.endDate.slice(0, 10) : '',
      reason: rule.reason || '',
      isActive: rule.isActive !== false,
    });
    setRecurringRuleMessage('');
  };

  const handleRecurringRuleSubmit = async (e) => {
    e.preventDefault();
    setRecurringRuleMessage('');

    try {
      const payload = {
        ...recurringRuleForm,
        courtCode: recurringRuleForm.courtCode || '',
        daysOfWeek: recurringRuleForm.daysOfWeek.map(Number),
        endDate: recurringRuleForm.endDate || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/api/recurring-block-rules${editingRuleId ? `/${editingRuleId}` : ''}`, {
        method: editingRuleId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setRecurringRuleMessage(data.message || 'Unable to save recurring block rule');
        return;
      }

      const savedRule = data.rule || data;
      setRecurringRules((current) => (
        editingRuleId
          ? current.map((rule) => (rule._id === savedRule._id ? savedRule : rule))
          : [savedRule, ...current]
      ));
      setRecurringRuleMessage(`Recurring rule saved. ${data.applySummary?.modifiedSlots || 0} existing slot${Number(data.applySummary?.modifiedSlots || 0) === 1 ? '' : 's'} blocked.`);
      resetRecurringRuleForm();
      if (activeTab === 'slots') fetchManagedSlots();
    } catch (error) {
      console.error('Recurring rule save error:', error);
      setRecurringRuleMessage('Unable to save recurring rule. Please try again.');
    }
  };

  const handleDeleteRecurringRule = async (rule) => {
    if (!window.confirm(`Remove recurring block rule "${rule.reason}"? Existing blocked slots will not be automatically unblocked.`)) {
      return;
    }

    setRecurringRuleMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/recurring-block-rules/${rule._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await readBody(res);

      if (!res.ok) {
        setRecurringRuleMessage(data.message || 'Unable to delete recurring block rule');
        return;
      }

      setRecurringRules((current) => current.filter((item) => item._id !== rule._id));
      setRecurringRuleMessage('Recurring rule removed.');
    } catch (error) {
      console.error('Recurring rule delete error:', error);
      setRecurringRuleMessage('Unable to delete recurring rule. Please try again.');
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
        incharge: {
          name: venue?.contacts?.incharge?.name || '',
          phone: venue?.contacts?.incharge?.phone || '',
          email: venue?.contacts?.incharge?.email || '',
          whatsapp: venue?.contacts?.incharge?.whatsapp || '',
        },
      },
      courtGroups: normalizeCourtGroupsForForm(venue?.courtGroups),
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

  const handleCourtGroupChange = (index, field, value) => {
    setVenueSettings((current) => ({
      ...current,
      courtGroups: current.courtGroups.map((group, groupIndex) => (
        groupIndex === index ? { ...group, [field]: value } : group
      )),
    }));
  };

  const addCourtGroup = () => {
    setVenueSettings((current) => ({
      ...current,
      courtGroups: [...current.courtGroups, { ...emptyCourtGroup }],
    }));
  };

  const removeCourtGroup = (index) => {
    setVenueSettings((current) => ({
      ...current,
      courtGroups: current.courtGroups.filter((_, groupIndex) => groupIndex !== index),
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
          courtGroups: serializeCourtGroups(venueSettings.courtGroups),
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
                    <td className="p-4 font-mono text-sm text-gray-400">{getBookingDisplayId(booking)}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{booking.venueId?.name || 'Venue unavailable'}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatVenueLocation(booking.venueId)}</p>
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
          <p className="text-gray-400">
            Manage venues, bookings, slots, and balances.
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Today's Revenue" value={loading ? '...' : formatCurrency(revenueSummary.todayRevenue)} icon={<RefreshCw size={20} />} />
        <KpiCard title="Today's Bookings" value={loading ? '...' : revenueSummary.todayBookings} icon={<RefreshCw size={20} />} />
        <KpiCard title="Upcoming Bookings" value={loading ? '...' : revenueSummary.upcomingBookings} icon={<MapPin size={20} />} />
        <KpiCard title="Active Venues" value={loading ? '...' : venues.length} icon={<MapPin size={20} />} />
        <KpiCard title="Total Revenue" value={loading ? '...' : formatCurrency(revenueSummary.totalRevenue)} icon={<RefreshCw size={20} />} />
        <KpiCard title="Total Bookings" value={loading ? '...' : revenueSummary.totalBookings} icon={<MapPin size={20} />} />
        <KpiCard title="Pending Balance" value={loading ? '...' : pendingBalanceBookings.length} icon={<RefreshCw size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-[#39FF14]" /> Revenue Overview</h3>
          <Bar data={{
            labels: ['Total', 'Today', 'Cancelled'],
            datasets: [{
              label: 'Amount (Rs)',
              data: [revenueSummary.totalRevenue, revenueSummary.todayRevenue, 0],
              backgroundColor: ['#39FF14', '#10B981', '#EF4444'],
            }]
          }} />
        </div>
        <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CalendarDays size={20} className="text-[#39FF14]" /> Bookings Overview</h3>
          <Bar data={{
            labels: ['Total', 'Today', 'Upcoming', 'Cancelled'],
            datasets: [{
              label: 'Bookings',
              data: [revenueSummary.totalBookings, revenueSummary.todayBookings, revenueSummary.upcomingBookings, revenueSummary.cancelledBookings],
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
            }]
          }} />
        </div>
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
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-2"><MapPin size={14} /> {formatVenueLocation(venue)}</p>
                  {venue.venueCode && <p className="text-xs text-gray-600 mt-1">Code: {venue.venueCode}</p>}
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
                  <p className="text-gray-500 text-xs uppercase font-bold">Courts</p>
                  <p className="font-black text-white mt-1">{venue.courts || venue.numberOfCourts || 'Not set'}</p>
                </div>
                <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs uppercase font-bold">Sports</p>
                  <p className="font-black text-white mt-1">{formatSportTypes(venue.sportTypes) || 'Not set'}</p>
                </div>
                <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs uppercase font-bold">Status</p>
                  <p className="font-black text-white mt-1">{venue.isActive !== false ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">{venue.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {getVenueCourtGroups(venue).map((group) => (
                  <span key={group.courtCode} className="text-[10px] bg-[#0a0f1c] text-gray-400 border border-gray-800 rounded-lg px-2 py-1 font-bold uppercase">
                    {group.name}: {formatCourtGroupSports(group.sports)} | {group.courtCount || 1} court{Number(group.courtCount || 1) === 1 ? '' : 's'}{group.bookingMode && group.bookingMode !== 'independent' ? ` | ${group.bookingMode}` : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'bookings' && (
        <section className="space-y-4">
          <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Search</label>
              <input
                type="text"
                value={bookingFilters.search}
                onChange={(e) => setBookingFilters((current) => ({ ...current, search: e.target.value }))}
                placeholder="Search booking, player, phone, venue, location"
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
              <select
                value={bookingFilters.status}
                onChange={(e) => setBookingFilters((current) => ({ ...current, status: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                <option value="">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          {renderBookingList(filteredBookings)}
        </section>
      )}

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
                onChange={(e) => setSlotFilters((current) => ({ ...current, venueId: e.target.value, courtCode: '' }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                {venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Court Group</label>
              <select
                value={slotFilters.courtCode}
                onChange={(e) => setSlotFilters((current) => ({ ...current, courtCode: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                <option value="">All court groups</option>
                {getVenueCourtGroups(venues.find((venue) => venue._id === slotFilters.venueId)).map((group) => (
                  <option key={group.courtCode} value={group.courtCode}>{group.name}</option>
                ))}
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
            <div className={`rounded-xl px-4 py-3 text-sm border ${slotMessage.toLowerCase().includes('updated') || slotMessage.toLowerCase().includes('blocked') || slotMessage.toLowerCase().includes('unblocked') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
              {slotMessage}
            </div>
          )}

          {slotsLoading ? (
            <div className="p-10 text-center text-gray-500">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No slots found for the selected filters.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400">
                  <span className="font-black text-white">{selectedSlotIds.length}</span> selected for block/unblock
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={selectedSlotIds.length === 0 || slotUpdatingId === 'bulk'}
                    onClick={() => handleBulkSlotStatusUpdate('blocked')}
                    className="bg-red-500/10 text-red-400 border border-red-500/30 font-bold rounded-xl px-4 py-2 disabled:opacity-40"
                  >
                    Block Selected
                  </button>
                  <button
                    type="button"
                    disabled={selectedSlotIds.length === 0 || slotUpdatingId === 'bulk'}
                    onClick={() => handleBulkSlotStatusUpdate('available')}
                    className="bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 font-bold rounded-xl px-4 py-2 disabled:opacity-40"
                  >
                    Unblock Selected
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {slots.map((slot) => {
                  const isLockedStatus = slot.status === 'booked' || slot.status === 'locked';
                  const isSelected = selectedSlotIds.includes(slot._id);
                  return (
                    <div key={slot._id} className={`bg-[#0a0f1c] border rounded-xl p-4 transition ${isSelected ? 'border-[#39FF14] shadow-[0_0_0_1px_rgba(57,255,20,0.25)]' : 'border-gray-800'}`}>
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-bold text-white">{formatDate(slot.date)}</p>
                          <p className="text-sm text-gray-400 mt-1">{formatSlotRange(slot)}</p>
                          <p className="text-xs text-gray-600 mt-1">{slot.courtName || 'Court'} {slot.courtNumber ? `#${slot.courtNumber}` : ''}</p>
                        </div>
                        <span className="text-xs uppercase font-black text-gray-400">{slot.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">{formatCurrency(slot.price)}</p>
                      <label className={`mt-4 flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold ${isLockedStatus ? 'border-gray-800 text-gray-600' : 'border-gray-800 text-gray-300 cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isLockedStatus}
                          onChange={() => toggleSlotSelection(slot)}
                          className="accent-[#39FF14]"
                        />
                        Select slot
                      </label>
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
                onChange={(e) => setGenerateForm((current) => ({ ...current, venueId: e.target.value, courtCode: '' }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                {venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Court Group</label>
              <select
                value={generateForm.courtCode}
                onChange={(e) => setGenerateForm((current) => ({ ...current, courtCode: e.target.value }))}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
              >
                <option value="">Default court group</option>
                {getVenueCourtGroups(venues.find((venue) => venue._id === generateForm.venueId)).map((group) => (
                  <option key={group.courtCode} value={group.courtCode}>{group.name} ({formatCourtGroupSports(group.sports)})</option>
                ))}
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
                {type === 'time' ? (
                  <TimeSelect
                    value={generateForm[field]}
                    onChange={(value) => setGenerateForm((current) => ({ ...current, [field]: value }))}
                  />
                ) : (
                  <input
                    type={type}
                    min={type === 'number' ? '1' : undefined}
                    value={generateForm[field]}
                    onChange={(e) => setGenerateForm((current) => ({ ...current, [field]: e.target.value }))}
                    className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]"
                    required={field !== 'price'}
                  />
                )}
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

      {activeTab === 'recurring-blocks' && (
        <section className="space-y-5">
          <form onSubmit={handleRecurringRuleSubmit} className="bg-[#151b2b] border border-gray-800 rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">{editingRuleId ? 'Edit Recurring Block' : 'Create Recurring Block'}</h2>
                <p className="text-sm text-gray-500 mt-1">Block repeated coaching, academy, maintenance or tournament hours.</p>
              </div>
              {editingRuleId && (
                <button type="button" onClick={resetRecurringRuleForm} className="text-sm font-bold text-gray-400 hover:text-white">
                  Cancel Edit
                </button>
              )}
            </div>

            {recurringRuleMessage && (
              <div className={`rounded-xl px-4 py-3 text-sm border ${recurringRuleMessage.toLowerCase().includes('saved') || recurringRuleMessage.toLowerCase().includes('removed') ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                {recurringRuleMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Venue</label>
                <select
                  required
                  value={recurringRuleForm.venueId}
                  onChange={(e) => setRecurringRuleForm((current) => ({ ...current, venueId: e.target.value, courtCode: '' }))}
                  className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
                >
                  {venues.map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Court Group</label>
                <select
                  value={recurringRuleForm.courtCode}
                  onChange={(e) => handleRecurringRuleChange('courtCode', e.target.value)}
                  className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Whole venue / all court groups</option>
                  {getVenueCourtGroups(venues.find((venue) => venue._id === recurringRuleForm.venueId)).map((group) => (
                    <option key={group.courtCode} value={group.courtCode}>{group.name} ({formatCourtGroupSports(group.sports)})</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Days</label>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleRecurringRuleDay(day.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border ${recurringRuleForm.daysOfWeek.includes(day.value) ? 'bg-[#39FF14] text-black border-[#39FF14]' : 'bg-[#0a0f1c] text-gray-400 border-gray-800'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Time</label>
                <TimeSelect value={recurringRuleForm.startTime} onChange={(value) => handleRecurringRuleChange('startTime', value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">End Time</label>
                <TimeSelect value={recurringRuleForm.endTime} onChange={(value) => handleRecurringRuleChange('endTime', value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Date</label>
                <input required type="date" value={recurringRuleForm.startDate} onChange={(e) => handleRecurringRuleChange('startDate', e.target.value)} className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">End Date Optional</label>
                <input type="date" value={recurringRuleForm.endDate} onChange={(e) => handleRecurringRuleChange('endDate', e.target.value)} className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reason</label>
                <input required value={recurringRuleForm.reason} onChange={(e) => handleRecurringRuleChange('reason', e.target.value)} placeholder="Coaching, Maintenance, Tournament" className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <label className="flex items-center gap-3 bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-300">
                <input type="checkbox" checked={recurringRuleForm.isActive} onChange={(e) => handleRecurringRuleChange('isActive', e.target.checked)} className="accent-[#39FF14]" />
                Active
              </label>
            </div>

            <button type="submit" disabled={venues.length === 0} className="w-full md:w-auto bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl disabled:opacity-50">
              {editingRuleId ? 'Save Rule' : 'Create Rule'}
            </button>
          </form>

          <div className="bg-[#151b2b] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Recurring Rules</h2>
                <p className="text-sm text-gray-500">Booked slots are never modified by recurring rules.</p>
              </div>
              <button onClick={fetchRecurringRules} className="bg-white/10 text-white rounded-xl px-4 py-2 font-bold text-sm">
                Refresh
              </button>
            </div>
            {recurringRulesLoading ? (
              <div className="p-10 text-center text-gray-500">Loading recurring rules...</div>
            ) : recurringRules.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No recurring block rules yet.</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {recurringRules.map((rule) => (
                  <div key={rule._id} className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-white">{rule.reason}</h3>
                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${rule.isActive ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-gray-800 text-gray-500'}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{rule.venueId?.name || 'Venue'} | {rule.courtCode || 'All courts'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRuleDays(rule.daysOfWeek)} | {formatTime(rule.startTime)} - {formatTime(rule.endTime)} | From {formatDate(rule.startDate)}{rule.endDate ? ` to ${formatDate(rule.endDate)}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditRecurringRule(rule)} className="flex-1 lg:flex-none px-4 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteRecurringRule(rule)} className="flex-1 lg:flex-none px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
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

          <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-black text-white">Court Groups</h3>
                <p className="text-xs text-gray-500 mt-1">Manage physical court blocks and supported sports.</p>
              </div>
              <button
                type="button"
                onClick={addCourtGroup}
                className="bg-white/10 text-white font-bold rounded-xl px-4 py-2 hover:bg-white/20"
              >
                Add Court Group
              </button>
            </div>

            {venueSettings.courtGroups.map((group, index) => (
              <div key={`${group.courtCode || 'new'}-${index}`} className="bg-[#151b2b] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-white">Group {index + 1}</p>
                    {group.courtCode && <p className="text-xs text-gray-600">{group.courtCode}</p>}
                  </div>
                  {venueSettings.courtGroups.length > 1 && (
                    <button type="button" onClick={() => removeCourtGroup(index)} className="text-red-400 font-bold text-sm">
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={group.name} onChange={(e) => handleCourtGroupChange(index, 'name', e.target.value)} placeholder="Court group name" className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  <input value={group.sports} onChange={(e) => handleCourtGroupChange(index, 'sports', e.target.value)} placeholder="Sports: Football, Cricket" className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  <input type="number" min="1" value={group.courtCount} onChange={(e) => handleCourtGroupChange(index, 'courtCount', e.target.value)} placeholder="Court count" className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  <input type="number" min="1" value={group.pricePerHour} onChange={(e) => handleCourtGroupChange(index, 'pricePerHour', e.target.value)} placeholder="Price per hour" className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  <input value={group.courtType} onChange={(e) => handleCourtGroupChange(index, 'courtType', e.target.value)} placeholder="Court type" className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  <input value={group.dependencyGroup} onChange={(e) => handleCourtGroupChange(index, 'dependencyGroup', e.target.value)} placeholder="Dependency group e.g. tokyo-main-turf" className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  <select value={group.bookingMode} onChange={(e) => handleCourtGroupChange(index, 'bookingMode', e.target.value)} className="bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white">
                    <option value="independent">Independent</option>
                    <option value="full">Full Turf</option>
                    <option value="half">Half Turf</option>
                  </select>
                  <label className="flex items-center gap-3 bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3">
                    <input type="checkbox" checked={group.isActive} onChange={(e) => handleCourtGroupChange(index, 'isActive', e.target.checked)} />
                    <span className="font-bold text-white">Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {['owner', 'incharge'].map((role) => (
            <div key={role} className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-4">
              <h3 className="font-black text-white capitalize mb-3">{role} Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['name', 'phone', 'email', ...(role === 'owner' ? [] : ['whatsapp'])].map((field) => (
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
