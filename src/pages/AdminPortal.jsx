import React, { useEffect, useState } from 'react';
import { Shield, Users, Building2, XCircle, AlertTriangle, BarChart3, Search, Mail, RefreshCw, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatSportTypes, normalizeSportTypes } from '../utils/sports';

const emptyVenueForm = {
  name: '',
  sportTypes: [],
  location: '',
  city: '',
  area: '',
  landmark: '',
  coordinateLat: '',
  coordinateLng: '',
  address: '',
  pricePerHour: '',
  amenities: [],
  customAmenity: '',
  description: '',
  imageUrl: '',
  imageFileName: '',
  ownerAccountUserId: '',
  ownerAccountPhone: '',
  ownerAccountEmail: '',
  contactOwnerName: '',
  contactOwnerPhone: '',
  contactInchargeName: '',
  contactInchargePhone: '',
  contactInchargeWhatsapp: '',
  contactOperationalName: '',
  contactOperationalPhone: '',
  contactOperationalWhatsapp: '',
  courtGroups: [],
  isActive: true,
};

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

const emptySlotForm = {
  venueId: '',
  courtCode: '',
  date: '',
  startTime: '',
  endTime: '',
  price: '',
};

const emptyGenerateSlotsForm = {
  venueId: '',
  courtCode: '',
  startDate: '',
  openingTime: '06:00',
  closingTime: '23:00',
  slotDurationMinutes: '60',
  price: '',
  days: '30',
};

const emptyRecurringBlockForm = {
  venueId: '',
  courtCode: '',
  daysOfWeek: [],
  startTime: '',
  endTime: '',
  startDate: '',
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

const sportTypeOptions = [
  'Football',
  'Cricket',
  'Badminton',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Pickleball',
  'Box Cricket',
  'Other',
];

const amenityOptions = [
  'Parking',
  'Washroom',
  'Drinking Water',
  'Changing Room',
  'Flood Lights',
  'First Aid',
  'Seating',
  'Cafeteria',
  'Equipment Rental',
];

const contactTabs = [
  { id: 'owner', label: 'Owner Contact' },
  { id: 'incharge', label: 'Incharge Contact' },
  { id: 'operational', label: 'Operational Contact' },
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const toList = (value) => (Array.isArray(value) ? value : String(value || '').split(','))
  .map((item) => item.trim())
  .filter(Boolean);

const uniqueList = (items = []) => (
  items.reduce((values, item) => {
    const trimmed = String(item || '').trim();
    if (!trimmed) return values;
    return values.some((value) => value.toLowerCase() === trimmed.toLowerCase()) ? values : [...values, trimmed];
  }, [])
);

const toSportList = (value) => uniqueList(normalizeSportTypes(toList(value)));
const formatCourtGroupSports = (sports = []) => formatSportTypes(sports);

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
      name: String(group.name || '').trim(),
      sports: toSportList(group.sports),
      courtCount: Number(group.courtCount) || 1,
      pricePerHour: Number(group.pricePerHour) || 0,
      courtType: String(group.courtType || '').trim() || 'Standard',
      dependencyGroup: String(group.dependencyGroup || '').trim(),
      bookingMode: group.bookingMode || 'independent',
      isActive: group.isActive !== false,
    }))
    .filter((group) => group.name && group.sports.length > 0 && group.pricePerHour > 0)
);

const getVenueCourtGroups = (venue) => (
  Array.isArray(venue?.courtGroups) && venue.courtGroups.length > 0
    ? venue.courtGroups
    : [{ courtCode: 'legacy', name: 'Main Court', sports: venue?.sportTypes || [], courtCount: 1, pricePerHour: venue?.pricePerHour, courtType: 'Standard', dependencyGroup: '', bookingMode: 'independent', isActive: true }]
);

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
    className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
  >
    <option value="">Select time</option>
    {timeOptions.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

const formatSlotTimes = (slots = []) => {
  if (!slots.length) return 'Time unavailable';

  return slots
    .map((slot) => [formatTime(slot.startTime), formatTime(slot.endTime)].filter(Boolean).join(' - '))
    .filter(Boolean)
    .join(', ');
};

const formatRuleDays = (days = []) => dayOptions
  .filter((day) => days.includes(day.value))
  .map((day) => day.label)
  .join(', ') || 'No days';

const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' • ') || venue?.location || 'Location unavailable'
);

const formatRequestLocation = (request) => (
  [request?.area, request?.city, request?.landmark].filter(Boolean).join(' • ') || request?.location || 'Location unavailable'
);

const canCollectBookingBalance = (booking) => (
  Number(booking?.remainingAmount || 0) > 0 &&
  booking?.bookingStatus !== 'cancelled' &&
  booking?.paymentStatus !== 'completed'
);

const getBookingDisplayId = (booking) => booking?.bookingCode || (booking?._id || booking?.id || '').slice(-8).toUpperCase();

const AdminPortal = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [activeSection, setActiveSection] = useState('venues');
  const [venues, setVenues] = useState([]);
  const [venueForm, setVenueForm] = useState({ ...emptyVenueForm, courtGroups: [{ ...emptyCourtGroup }] });
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueError, setVenueError] = useState('');
  const [venueImageUploading, setVenueImageUploading] = useState(false);
  const [venueImageMessage, setVenueImageMessage] = useState('');
  const [activeContactTab, setActiveContactTab] = useState('owner');
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
  const [recurringRules, setRecurringRules] = useState([]);
  const [recurringRuleForm, setRecurringRuleForm] = useState(emptyRecurringBlockForm);
  const [editingRuleId, setEditingRuleId] = useState('');
  const [recurringRulesLoading, setRecurringRulesLoading] = useState(false);
  const [recurringRuleMessage, setRecurringRuleMessage] = useState('');

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

  const fetchRecurringRules = async () => {
    setRecurringRulesLoading(true);
    setRecurringRuleMessage('');

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(apiUrl('/api/recurring-block-rules'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setRecurringRuleMessage(getVenueErrorMessage(data, 'Failed to load recurring block rules'));
        return;
      }

      setRecurringRules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Recurring rules fetch error:', error);
      setRecurringRuleMessage(`Unable to load recurring rules: ${error.message}`);
    } finally {
      setRecurringRulesLoading(false);
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
    if (activeSection === 'recurring-blocks') {
      fetchRecurringRules();
      if (venues.length === 0) fetchVenues();
    }
  }, [activeSection]);

  const resetVenueForm = () => {
    setVenueForm({ ...emptyVenueForm, courtGroups: [{ ...emptyCourtGroup }] });
    setEditingVenueId(null);
    setVenueImageMessage('');
    setVenueImageUploading(false);
    setActiveContactTab('owner');
  };

  const handleVenueChange = (field, value) => {
    setVenueForm((current) => ({ ...current, [field]: value }));
  };

  const toggleVenueListValue = (field, value) => {
    setVenueForm((current) => {
      const currentValues = toList(current[field]);
      const nextValues = currentValues.some((item) => item.toLowerCase() === value.toLowerCase())
        ? currentValues.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : uniqueList([...currentValues, value]);

      return { ...current, [field]: nextValues };
    });
  };

  const addCustomAmenity = () => {
    const customAmenity = String(venueForm.customAmenity || '').trim();
    if (!customAmenity) return;

    setVenueForm((current) => ({
      ...current,
      amenities: uniqueList([...toList(current.amenities), customAmenity]),
      customAmenity: '',
    }));
  };

  const handleCourtGroupChange = (index, field, value) => {
    setVenueForm((current) => ({
      ...current,
      courtGroups: current.courtGroups.map((group, groupIndex) => (
        groupIndex === index ? { ...group, [field]: value } : group
      )),
    }));
  };

  const addCourtGroup = () => {
    setVenueForm((current) => ({
      ...current,
      courtGroups: [...current.courtGroups, { ...emptyCourtGroup }],
    }));
  };

  const removeCourtGroup = (index) => {
    setVenueForm((current) => ({
      ...current,
      courtGroups: current.courtGroups.filter((_, groupIndex) => groupIndex !== index),
    }));
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
    setVenueForm((current) => ({ ...current, imageFileName: file.name }));

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
      setVenueImageMessage(`${file.name} uploaded successfully.`);
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
        courtCode: slotForm.courtCode,
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
        courtCode: generateSlotsForm.courtCode,
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
      setGenerateSlotsMessage('Monthly slots created successfully.');
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

    if (toSportList(venueForm.sportTypes).length === 0) {
      setVenueError('Please select at least one sport type.');
      return;
    }

    const payload = {
      name: venueForm.name.trim(),
      sportTypes: toSportList(venueForm.sportTypes),
      location: [venueForm.area, venueForm.city, venueForm.address].map((item) => item.trim()).filter(Boolean).join(', '),
      city: venueForm.city.trim(),
      area: venueForm.area.trim(),
      landmark: venueForm.landmark.trim(),
      address: venueForm.address.trim(),
      pricePerHour: Number(venueForm.pricePerHour),
      amenities: uniqueList(toList(venueForm.amenities)),
      description: venueForm.description.trim(),
      ownerUserId: venueForm.ownerAccountUserId.trim(),
      ownerPhone: venueForm.ownerAccountPhone.trim(),
      ownerEmail: venueForm.ownerAccountEmail.trim(),
      contacts: {
        owner: {
          name: venueForm.contactOwnerName.trim(),
          phone: venueForm.contactOwnerPhone.trim(),
        },
        incharge: {
          name: venueForm.contactInchargeName.trim(),
          phone: venueForm.contactInchargePhone.trim(),
          whatsapp: venueForm.contactInchargeWhatsapp.trim(),
        },
        operational: {
          name: venueForm.contactOperationalName.trim(),
          phone: venueForm.contactOperationalPhone.trim(),
          whatsapp: venueForm.contactOperationalWhatsapp.trim(),
        },
      },
      isActive: venueForm.isActive,
    };

    const courtGroups = serializeCourtGroups(venueForm.courtGroups);
    if (courtGroups.length > 0) {
      payload.courtGroups = courtGroups;
    }

    if (venueForm.imageUrl.trim()) {
      payload.images = [venueForm.imageUrl.trim()];
    }

    if (venueForm.coordinateLat || venueForm.coordinateLng) {
      payload.coordinates = {};
      if (venueForm.coordinateLat) payload.coordinates.lat = Number(venueForm.coordinateLat);
      if (venueForm.coordinateLng) payload.coordinates.lng = Number(venueForm.coordinateLng);
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
      sportTypes: toSportList(venue.sportTypes),
      location: venue.location || '',
      city: venue.city || '',
      area: venue.area || '',
      landmark: venue.landmark || '',
      coordinateLat: venue.coordinates?.lat ?? '',
      coordinateLng: venue.coordinates?.lng ?? '',
      address: venue.address || '',
      pricePerHour: venue.pricePerHour || '',
      amenities: uniqueList(venue.amenities || []),
      customAmenity: '',
      description: venue.description || '',
      imageUrl: venue.images?.[0] || '',
      imageFileName: '',
      contactOwnerName: venue.contacts?.owner?.name || '',
      contactOwnerPhone: venue.contacts?.owner?.phone || '',
      ownerAccountUserId: venue.ownerId?._id || venue.ownerId || '',
      ownerAccountPhone: '',
      ownerAccountEmail: '',
      contactInchargeName: venue.contacts?.incharge?.name || '',
      contactInchargePhone: venue.contacts?.incharge?.phone || '',
      contactInchargeWhatsapp: venue.contacts?.incharge?.whatsapp || '',
      contactOperationalName: venue.contacts?.operational?.name || '',
      contactOperationalPhone: venue.contacts?.operational?.phone || '',
      contactOperationalWhatsapp: venue.contacts?.operational?.whatsapp || '',
      courtGroups: normalizeCourtGroupsForForm(venue.courtGroups),
      isActive: venue.isActive !== false,
    });
    setActiveContactTab('owner');
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
    setRecurringRuleForm(emptyRecurringBlockForm);
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
      startDate: rule.startDate ? rule.startDate.slice(0, 10) : '',
      endDate: rule.endDate ? rule.endDate.slice(0, 10) : '',
      reason: rule.reason || '',
      isActive: rule.isActive !== false,
    });
    setRecurringRuleMessage('');
  };

  const handleRecurringRuleSubmit = async (e) => {
    e.preventDefault();
    setRecurringRuleMessage('');

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setRecurringRuleMessage('Admin token not found. Please login again.');
      return;
    }

    const payload = {
      ...recurringRuleForm,
      courtCode: recurringRuleForm.courtCode || '',
      daysOfWeek: recurringRuleForm.daysOfWeek.map(Number),
      endDate: recurringRuleForm.endDate || undefined,
    };

    try {
      const res = await fetch(apiUrl(`/api/recurring-block-rules${editingRuleId ? `/${editingRuleId}` : ''}`), {
        method: editingRuleId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setRecurringRuleMessage(getVenueErrorMessage(data, 'Failed to save recurring block rule'));
        return;
      }

      const savedRule = data.rule || data;
      setRecurringRules((current) => (
        editingRuleId
          ? current.map((rule) => (rule._id === savedRule._id ? savedRule : rule))
          : [savedRule, ...current]
      ));
      resetRecurringRuleForm();
      setRecurringRuleMessage(`Recurring rule saved. ${data.applySummary?.modifiedSlots || 0} existing slot${Number(data.applySummary?.modifiedSlots || 0) === 1 ? '' : 's'} blocked.`);
    } catch (error) {
      console.error('Recurring rule save error:', error);
      setRecurringRuleMessage(`Unable to save recurring rule: ${error.message}`);
    }
  };

  const handleDeleteRecurringRule = async (rule) => {
    if (!window.confirm(`Remove recurring block rule "${rule.reason}"? Existing blocked slots will not be automatically unblocked.`)) {
      return;
    }

    setRecurringRuleMessage('');

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(apiUrl(`/api/recurring-block-rules/${rule._id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        setRecurringRuleMessage(getVenueErrorMessage(data, 'Failed to delete recurring block rule'));
        return;
      }

      setRecurringRules((current) => current.filter((item) => item._id !== rule._id));
      setRecurringRuleMessage('Recurring rule removed.');
    } catch (error) {
      console.error('Recurring rule delete error:', error);
      setRecurringRuleMessage(`Unable to delete recurring rule: ${error.message}`);
    }
  };

  const navItems = [
    { id: 'owner-requests', label: 'Owner Requests', icon: Mail },
    { id: 'platform-bookings', label: 'Platform Bookings', icon: BarChart3 },
    { id: 'users', label: 'Manage Users', icon: Users, comingSoon: true },
    { id: 'venues', label: 'Manage Venues', icon: Building2 },
    { id: 'recurring-blocks', label: 'Recurring Blocks', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, comingSoon: true },
    { id: 'notification-metrics', label: 'Notifications', icon: Shield }
  ];

  // Notification metrics state
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState('');

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError('');
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/notifications/admin-metrics'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMetrics(await res.json());
      } else {
        setMetricsError('Failed to load notification metrics');
      }
    } catch {
      setMetricsError('Network error loading metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'notification-metrics') {
      fetchMetrics();
    }
  }, [activeSection]);

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
                            <span><strong className="text-gray-300">Applicant:</strong> {request.ownerName}</span>
                            <span><strong className="text-gray-300">Applicant Phone:</strong> {request.phone}</span>
                            <span><strong className="text-gray-300">Applicant Email:</strong> {request.email || 'Not provided'}</span>
                            <span><strong className="text-gray-300">Location:</strong> {formatRequestLocation(request)}</span>
                            <span><strong className="text-gray-300">Incharge:</strong> {request.contacts?.incharge?.name || 'Not provided'}</span>
                            <span><strong className="text-gray-300">Incharge Phone:</strong> {request.contacts?.incharge?.phone || request.contacts?.incharge?.whatsapp || 'Not provided'}</span>
                            <span><strong className="text-gray-300">Sports:</strong> {formatSportTypes(request.sportTypes) || 'Not provided'}</span>
                            <span><strong className="text-gray-300">Price:</strong> {request.pricePerHour ? `Rs ${request.pricePerHour}/hr` : 'Not provided'}</span>
                            <span><strong className="text-gray-300">Created:</strong> {formatRequestDate(request.createdAt || request.submittedAt)}</span>
                          </div>
                          {Array.isArray(request.courtGroups) && request.courtGroups.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {request.courtGroups.map((group, groupIndex) => (
                                <span key={`${group.name || 'court-group'}-${groupIndex}`} className="rounded-lg border border-gray-800 bg-black/30 px-3 py-2 text-[10px] font-bold uppercase text-gray-400">
                                  {group.name || 'Court Group'} | {formatCourtGroupSports(group.sports) || 'Sport'} | {group.courtCount || 1} court{Number(group.courtCount || 1) === 1 ? '' : 's'} | Rs {group.pricePerHour || 0}/hr | {group.courtType || 'Standard'}
                                </span>
                              ))}
                            </div>
                          )}
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
                                #{getBookingDisplayId(booking)}
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-white">{booking.userId?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500 mt-1">{booking.userId?.phone || 'Phone unavailable'}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-white">{booking.venueId?.name || 'Venue unavailable'}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatVenueLocation(booking.venueId)}</p>
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
                      Select sports and amenities, then save the venue details.
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
                    <div className="flex flex-wrap gap-2">
                      {sportTypeOptions.map((sport) => {
                        const selected = toList(venueForm.sportTypes).includes(sport);
                        return (
                          <button
                            key={sport}
                            type="button"
                            onClick={() => toggleVenueListValue('sportTypes', sport)}
                            className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${selected ? 'border-[#39FF14] bg-[#39FF14] text-black' : 'border-gray-800 bg-[#0a0f1c] text-gray-300 hover:border-gray-600'}`}
                          >
                            {sport}
                          </button>
                        );
                      })}
                    </div>
                    {toList(venueForm.sportTypes).length === 0 && (
                      <p className="mt-2 text-xs text-red-400">Select at least one sport.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      City
                    </label>
                    <input
                      value={venueForm.city}
                      onChange={(e) => handleVenueChange('city', e.target.value)}
                      placeholder="Trichy"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Area
                    </label>
                    <input
                      value={venueForm.area}
                      onChange={(e) => handleVenueChange('area', e.target.value)}
                      placeholder="Thillai Nagar"
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

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Landmark
                    </label>
                    <input
                      value={venueForm.landmark}
                      onChange={(e) => handleVenueChange('landmark', e.target.value)}
                      placeholder="Near bus stand"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Coordinates Optional
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="any"
                        value={venueForm.coordinateLat}
                        onChange={(e) => handleVenueChange('coordinateLat', e.target.value)}
                        placeholder="Latitude"
                        className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                      />
                      <input
                        type="number"
                        step="any"
                        value={venueForm.coordinateLng}
                        onChange={(e) => handleVenueChange('coordinateLng', e.target.value)}
                        placeholder="Longitude"
                        className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>
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
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map((amenity) => {
                        const selected = toList(venueForm.amenities).some((item) => item.toLowerCase() === amenity.toLowerCase());
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleVenueListValue('amenities', amenity)}
                            className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${selected ? 'border-[#39FF14] bg-[#39FF14] text-black' : 'border-gray-800 bg-[#0a0f1c] text-gray-300 hover:border-gray-600'}`}
                          >
                            {amenity}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        value={venueForm.customAmenity}
                        onChange={(e) => handleVenueChange('customAmenity', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomAmenity();
                          }
                        }}
                        placeholder="Custom amenity"
                        className="min-w-0 flex-1 bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                      />
                      <button
                        type="button"
                        onClick={addCustomAmenity}
                        className="bg-white/10 text-white font-bold px-4 py-3 rounded-xl text-sm hover:bg-white/20"
                      >
                        + Other
                      </button>
                    </div>
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
                    {venueForm.imageFileName && !venueImageMessage && (
                      <p className="mt-2 text-xs font-bold text-gray-400">Selected: {venueForm.imageFileName}</p>
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

                  <div className="md:col-span-2 border-t border-gray-800 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest">Court Groups</h4>
                        <p className="text-xs text-gray-600 mt-1">Each group is a physical court block. Multiple sports can share the same group.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addCourtGroup}
                        className="bg-white/10 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-white/20"
                      >
                        Add Court Group
                      </button>
                    </div>

                    <div className="space-y-4">
                      {venueForm.courtGroups.map((group, index) => (
                        <div key={`${group.courtCode || 'new'}-${index}`} className="bg-[#0a0f1c] border border-gray-800 rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                              <p className="font-bold text-white">Court Group {index + 1}</p>
                              {group.courtCode && <p className="text-xs text-gray-600 mt-1">{group.courtCode}</p>}
                            </div>
                            {venueForm.courtGroups.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCourtGroup(index)}
                                className="text-red-400 font-bold text-sm hover:text-red-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              value={group.name}
                              onChange={(e) => handleCourtGroupChange(index, 'name', e.target.value)}
                              placeholder="Badminton Block"
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                            <input
                              value={group.sports}
                              onChange={(e) => handleCourtGroupChange(index, 'sports', e.target.value)}
                              placeholder="Badminton, Pickleball"
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                            <input
                              type="number"
                              min="1"
                              value={group.courtCount}
                              onChange={(e) => handleCourtGroupChange(index, 'courtCount', e.target.value)}
                              placeholder="Court count"
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                            <input
                              type="number"
                              min="1"
                              value={group.pricePerHour}
                              onChange={(e) => handleCourtGroupChange(index, 'pricePerHour', e.target.value)}
                              placeholder="Price per hour"
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                            <input
                              value={group.courtType}
                              onChange={(e) => handleCourtGroupChange(index, 'courtType', e.target.value)}
                              placeholder="Indoor, Turf, Outdoor"
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                            <input
                              value={group.dependencyGroup}
                              onChange={(e) => handleCourtGroupChange(index, 'dependencyGroup', e.target.value)}
                              placeholder="Dependency group e.g. tokyo-main-turf"
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                            <select
                              value={group.bookingMode}
                              onChange={(e) => handleCourtGroupChange(index, 'bookingMode', e.target.value)}
                              className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            >
                              <option value="independent">Independent</option>
                              <option value="full">Full Turf</option>
                              <option value="half">Half Turf</option>
                            </select>
                            <label className="flex items-center gap-3 bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-300">
                              <input
                                type="checkbox"
                                checked={group.isActive}
                                onChange={(e) => handleCourtGroupChange(index, 'isActive', e.target.checked)}
                                className="w-4 h-4 accent-[#39FF14]"
                              />
                              Court group active
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-gray-800 pt-4">
                    <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-3">
                      Owner Login Account
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Use an existing PlayNow user. This controls venue ownership and owner dashboard access.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <input
                        value={venueForm.ownerAccountUserId}
                        onChange={(e) => handleVenueChange('ownerAccountUserId', e.target.value)}
                        placeholder="User Mongo ID optional"
                        className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                      />
                      <input
                        value={venueForm.ownerAccountPhone}
                        onChange={(e) => handleVenueChange('ownerAccountPhone', e.target.value)}
                        placeholder="Owner login phone"
                        className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                      />
                      <input
                        value={venueForm.ownerAccountEmail}
                        onChange={(e) => handleVenueChange('ownerAccountEmail', e.target.value)}
                        placeholder="Owner login email"
                        className="w-full bg-[#151b2b] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-3">
                      Operational Contacts
                    </h4>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {contactTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveContactTab(tab.id)}
                          className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${activeContactTab === tab.id ? 'border-[#39FF14] bg-[#39FF14] text-black' : 'border-gray-800 bg-[#0a0f1c] text-gray-300 hover:border-gray-600'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeContactTab === 'owner' && (
                        <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                          Owner Name
                        </label>
                        <input
                          value={venueForm.contactOwnerName}
                          onChange={(e) => handleVenueChange('contactOwnerName', e.target.value)}
                          className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                          Owner Phone
                        </label>
                        <input
                          value={venueForm.contactOwnerPhone}
                          onChange={(e) => handleVenueChange('contactOwnerPhone', e.target.value)}
                          className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>
                        </>
                      )}
                      {activeContactTab === 'incharge' && (
                        <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                          Incharge Name
                        </label>
                        <input
                          value={venueForm.contactInchargeName}
                          onChange={(e) => handleVenueChange('contactInchargeName', e.target.value)}
                          className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                          Incharge Phone
                        </label>
                        <input
                          value={venueForm.contactInchargePhone}
                          onChange={(e) => handleVenueChange('contactInchargePhone', e.target.value)}
                          className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                          Incharge WhatsApp
                        </label>
                        <input
                          value={venueForm.contactInchargeWhatsapp}
                          onChange={(e) => handleVenueChange('contactInchargeWhatsapp', e.target.value)}
                          className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                        />
                      </div>
                        </>
                      )}
                      {activeContactTab === 'operational' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                              Operational Name
                            </label>
                            <input
                              value={venueForm.contactOperationalName}
                              onChange={(e) => handleVenueChange('contactOperationalName', e.target.value)}
                              className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                              Operational Phone
                            </label>
                            <input
                              value={venueForm.contactOperationalPhone}
                              onChange={(e) => handleVenueChange('contactOperationalPhone', e.target.value)}
                              className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                              Operational WhatsApp
                            </label>
                            <input
                              value={venueForm.contactOperationalWhatsapp}
                              onChange={(e) => handleVenueChange('contactOperationalWhatsapp', e.target.value)}
                              className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                            />
                          </div>
                        </>
                      )}
                    </div>
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
                          <p className="text-sm text-gray-400">{formatVenueLocation(venue)}</p>
                          {venue.venueCode && (
                            <p className="text-xs text-gray-600 mt-1">Code: {venue.venueCode}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatSportTypes(venue.sportTypes) || 'No sports'} | Rs {venue.pricePerHour}/hr
                          </p>
                          {getVenueCourtGroups(venue).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {getVenueCourtGroups(venue).map((group, groupIndex) => (
                                <span key={group.courtCode || `${group.name || 'court'}-${groupIndex}`} className="text-[10px] bg-black/30 text-gray-400 border border-gray-800 px-2 py-1 rounded-lg font-bold uppercase">
                                  {group.name}: {group.courtCount || 1} court{Number(group.courtCount || 1) === 1 ? '' : 's'} | Rs {group.pricePerHour}/hr{group.bookingMode && group.bookingMode !== 'independent' ? ` | ${group.bookingMode}` : ''}
                                </span>
                              ))}
                            </div>
                          )}
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
                    Create Slots = create slots for a specific date/day.
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
                      onChange={(e) => {
                        handleSlotChange('venueId', e.target.value);
                        handleSlotChange('courtCode', '');
                      }}
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

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Court Group
                    </label>
                    <select
                      value={slotForm.courtCode}
                      onChange={(e) => handleSlotChange('courtCode', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">Default court group</option>
                      {getVenueCourtGroups(venues.find((venue) => venue._id === slotForm.venueId)).map((group, groupIndex) => (
                        <option key={group.courtCode || `${group.name || 'court'}-${groupIndex}`} value={group.courtCode}>
                          {group.name} ({formatCourtGroupSports(group.sports)})
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
                    <TimeSelect value={slotForm.startTime} onChange={(value) => handleSlotChange('startTime', value)} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      End Time
                    </label>
                    <TimeSelect value={slotForm.endTime} onChange={(value) => handleSlotChange('endTime', value)} />
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
                  <h3 className="text-xl font-bold">Create Monthly Slots</h3>
                  <p className="text-sm text-gray-500">
                    Create Monthly Slots = bulk create slots for a full month using repeated timing pattern.
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
                      onChange={(e) => {
                        handleGenerateSlotsChange('venueId', e.target.value);
                        handleGenerateSlotsChange('courtCode', '');
                      }}
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

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Court Group
                    </label>
                    <select
                      value={generateSlotsForm.courtCode}
                      onChange={(e) => handleGenerateSlotsChange('courtCode', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">Default court group</option>
                      {getVenueCourtGroups(venues.find((venue) => venue._id === generateSlotsForm.venueId)).map((group, groupIndex) => (
                        <option key={group.courtCode || `${group.name || 'court'}-${groupIndex}`} value={group.courtCode}>
                          {group.name} ({formatCourtGroupSports(group.sports)})
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
                    <TimeSelect value={generateSlotsForm.openingTime} onChange={(value) => handleGenerateSlotsChange('openingTime', value)} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Closing Time
                    </label>
                    <TimeSelect value={generateSlotsForm.closingTime} onChange={(value) => handleGenerateSlotsChange('closingTime', value)} />
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
                    {generateSlotsLoading ? 'Creating Monthly Slots...' : 'Create Monthly Slots'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'recurring-blocks' && (
            <div className="space-y-6">
              <form
                onSubmit={handleRecurringRuleSubmit}
                className="bg-[#151b2b] border border-gray-800 rounded-3xl p-4 md:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{editingRuleId ? 'Edit Recurring Block' : 'Create Recurring Block'}</h3>
                    <p className="text-sm text-gray-500">Automatically block coaching, academy, maintenance or tournament timings.</p>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Venue</label>
                    <select
                      required
                      value={recurringRuleForm.venueId}
                      onChange={(e) => setRecurringRuleForm((current) => ({ ...current, venueId: e.target.value, courtCode: '' }))}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">Select venue</option>
                      {venues.map((venue) => (
                        <option key={venue._id} value={venue._id}>{venue.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Court Group</label>
                    <select
                      value={recurringRuleForm.courtCode}
                      onChange={(e) => handleRecurringRuleChange('courtCode', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    >
                      <option value="">Whole venue / all court groups</option>
                      {getVenueCourtGroups(venues.find((venue) => venue._id === recurringRuleForm.venueId)).map((group) => (
                        <option key={group.courtCode} value={group.courtCode}>
                          {group.name} ({formatCourtGroupSports(group.sports)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Days</label>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Time</label>
                    <TimeSelect value={recurringRuleForm.startTime} onChange={(value) => handleRecurringRuleChange('startTime', value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Time</label>
                    <TimeSelect value={recurringRuleForm.endTime} onChange={(value) => handleRecurringRuleChange('endTime', value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Date</label>
                    <input required type="date" value={recurringRuleForm.startDate} onChange={(e) => handleRecurringRuleChange('startDate', e.target.value)} className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Date Optional</label>
                    <input type="date" value={recurringRuleForm.endDate} onChange={(e) => handleRecurringRuleChange('endDate', e.target.value)} className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
                  </div>
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Reason</label>
                    <input required value={recurringRuleForm.reason} onChange={(e) => handleRecurringRuleChange('reason', e.target.value)} placeholder="Coaching, Maintenance, Tournament" className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <label className="flex items-center gap-3 bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-300">
                    <input type="checkbox" checked={recurringRuleForm.isActive} onChange={(e) => handleRecurringRuleChange('isActive', e.target.checked)} className="accent-[#39FF14]" />
                    Active
                  </label>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="w-full sm:w-auto bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#32E612] transition">
                    {editingRuleId ? 'Save Rule' : 'Create Rule'}
                  </button>
                </div>
              </form>

              <div className="bg-[#151b2b] border border-gray-800 rounded-3xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">Recurring Block Rules</h3>
                    <p className="text-sm text-gray-500">Rules block future available slots. Booked slots stay unchanged.</p>
                  </div>
                  <button onClick={fetchRecurringRules} className="bg-white/10 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-white/20">
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
                            <h4 className="font-black text-white">{rule.reason}</h4>
                            <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${rule.isActive ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-gray-800 text-gray-500'}`}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{rule.venueId?.name || 'Venue'} | {rule.courtCode || 'All courts'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRuleDays(rule.daysOfWeek)} | {formatTime(rule.startTime)} - {formatTime(rule.endTime)} | From {formatRequestDate(rule.startDate)}{rule.endDate ? ` to ${formatRequestDate(rule.endDate)}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditRecurringRule(rule)} className="flex-1 lg:flex-none px-4 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteRecurringRule(rule)} className="flex-1 lg:flex-none px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'notification-metrics' && (
            <div className="space-y-6">
              {metricsError && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-2xl">
                  {metricsError}
                </div>
              )}

              {metricsLoading ? (
                <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-12 text-center">
                  <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Loading platform metrics...</p>
                </div>
              ) : metrics ? (
                <div className="space-y-6">
                  {/* Grid summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
                      <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Dispatched</h4>
                      <p className="text-3xl font-black text-[#39FF14] mt-2">{metrics.totalSent}</p>
                    </div>
                    <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
                      <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Read Alerts</h4>
                      <p className="text-3xl font-black text-white mt-2">{metrics.readCount}</p>
                    </div>
                    <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
                      <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Unread Alerts</h4>
                      <p className="text-3xl font-black text-white mt-2">{metrics.unreadCount}</p>
                    </div>
                    <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
                      <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Read Rate</h4>
                      <p className="text-3xl font-black text-white mt-2">{metrics.readRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Split analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* By Type */}
                    <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 border-b border-gray-800 pb-2">Distribution By Category</h3>
                      <div className="space-y-3">
                        {Object.entries(metrics.typeDistribution || {}).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{type}</span>
                            <span className="text-xs font-black text-[#39FF14]">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daily activity */}
                    <div className="bg-[#151b2b] border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 border-b border-gray-800 pb-2">Daily Dispatch Activity</h3>
                      <div className="space-y-3">
                        {(metrics.dailyActivity || []).map((day) => (
                          <div key={day._id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-gray-400">{day._id}</span>
                            <span className="text-xs font-black text-[#39FF14]">{day.count} sent</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No metrics data currently loaded.
                </div>
              )}
            </div>
          )}

          {activeSection !== 'owner-requests' && activeSection !== 'platform-bookings' && activeSection !== 'venues' && activeSection !== 'recurring-blocks' && activeSection !== 'notification-metrics' && (
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
