import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Clock, Info, Pencil, Trash2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { formatSportTypes } from '../utils/sports';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const UPCOMING_SLOT_DAYS = 30;
const getVenueImage = (venue) => (venue.images || []).find((image) => image && !image.includes('default-venue'));
const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' • ') || venue?.location || 'Location unavailable'
);

const getDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getUpcomingDateKeys = (days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return getDateKey(date);
  });
};

const isPastDateKey = (dateKey) => dateKey && dateKey < getDateKey(new Date());

const isPastSlotForToday = (slot) => {
  const dateKey = getDateKey(slot?.date);
  if (!dateKey || dateKey !== getDateKey(new Date()) || !slot?.endTime) return false;

  const [hours, minutes = '0'] = slot.endTime.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;

  const slotEnd = new Date();
  slotEnd.setHours(hours, minutes, 0, 0);
  return slotEnd <= new Date();
};

const isBookableSlot = (slot) => slot?.status === 'available' && !isPastSlotForToday(slot);

const formatDateLabel = (dateKey) => {
  if (!dateKey) return '';

  const todayKey = getDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = getDateKey(tomorrow);

  if (dateKey === todayKey) return 'Today';
  if (dateKey === tomorrowKey) return 'Tomorrow';

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const formatTime = (time) => {
  if (!time) return '';

  const [hourValue, minute = '00'] = time.split(':');
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

const formatSlotRange = (slot) => {
  if (!slot) return '';

  return [formatTime(slot.startTime), formatTime(slot.endTime)].filter(Boolean).join(' - ');
};

// ── Reusable star-rating widget ─────────────────────────
const StarRating = ({ value, onChange, size = 24, readonly = false }) => (
    <div className="flex flex-wrap gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onChange && onChange(star)}
        className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
      >
        <Star
          size={size}
          className={star <= value ? 'text-[#39FF14]' : 'text-gray-600'}
          fill={star <= value ? 'currentColor' : 'none'}
        />
      </button>
    ))}
  </div>
);

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const [venue, setVenue] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Review state ──────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const userReview = reviews.find(
    (r) => r.userId?._id === user?.id || r.userId?._id === user?._id
  );

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`);
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    const token = localStorage.getItem('playnow_token');
    if (!token) { setReviewError('Please log in to submit a review.'); return; }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewForm.rating, comment: reviewForm.comment })
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.message || 'Failed to submit review.'); return; }
      setReviewForm({ rating: 5, comment: '' });
      setReviewSuccess('Review submitted successfully!');
      await fetchReviews();
      const vRes = await fetch(`${API_BASE_URL}/api/venues/${id}`);
      if (vRes.ok) setVenue(await vRes.json());
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch {
      setReviewError('Network error. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleStartEdit = (review) => {
    setEditingReview(review._id);
    setEditForm({ rating: review.rating, comment: review.comment || '' });
    setReviewError('');
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: '' });
    setReviewError('');
  };

  const handleUpdateReview = async (reviewId) => {
    setReviewError('');
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/review/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editForm.rating, comment: editForm.comment })
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.message || 'Failed to update review.'); return; }
      setEditingReview(null);
      await fetchReviews();
      const vRes = await fetch(`${API_BASE_URL}/api/venues/${id}`);
      if (vRes.ok) setVenue(await vRes.json());
    } catch {
      setReviewError('Network error. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem('playnow_token');
    if (!token) return;
    setDeletingId(reviewId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/review/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { const d = await res.json(); setReviewError(d.message || 'Delete failed.'); return; }
      await fetchReviews();
      const vRes = await fetch(`${API_BASE_URL}/api/venues/${id}`);
      if (vRes.ok) setVenue(await vRes.json());
    } catch {
      setReviewError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Join venue room for real-time updates
  useEffect(() => {
    if (socket && id) {
      socket.emit('join_venue_room', id);
      
      socket.on('slotStatusChanged', (data) => {
        setAvailableSlots(prev => prev.map(slot => {
          if (data.slotIds.includes(slot._id)) {
            return { ...slot, status: data.status };
          }
          return slot;
        }));
      });

      socket.on('venueStatusChanged', (data) => {
        if (data.venueId === id) {
          setVenue(prev => ({ ...prev, isActive: data.isActive }));
        }
      });

      return () => {
        socket.off('slotStatusChanged');
        socket.off('venueStatusChanged');
      };
    }
  }, [socket, id]);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const dateKeys = getUpcomingDateKeys(UPCOMING_SLOT_DAYS);
        const slotRequests = dateKeys.map(async (dateKey) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/slots/venue/${id}?date=${dateKey}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          } catch (error) {
            console.error(`Error fetching slots for ${dateKey}:`, error);
            return [];
          }
        });

        const [venueRes, slotsByDate] = await Promise.all([
          fetch(`${API_BASE_URL}/api/venues/${id}`),
          Promise.all(slotRequests)
        ]);
        const venueData = await venueRes.json();
        const slotsData = slotsByDate.flat();
        const uniqueSlots = Array.from(new Map(
          slotsData.map((slot, index) => [
            slot._id || `${getDateKey(slot.date)}-${slot.startTime}-${index}`,
            slot
          ])
        ).values()).sort((a, b) => {
          const dateCompare = getDateKey(a.date).localeCompare(getDateKey(b.date));
          if (dateCompare !== 0) return dateCompare;
          return String(a.startTime || '').localeCompare(String(b.startTime || ''));
        });
        const futureDateKeys = [...new Set(uniqueSlots
          .filter((slot) => !isPastSlotForToday(slot))
          .map((slot) => getDateKey(slot.date))
          .filter((dateKey) => dateKey && !isPastDateKey(dateKey)))].sort();
        
        setVenue(venueData);
        setAvailableSlots(uniqueSlots);
        setSelectedDateKey((currentDateKey) => (
          currentDateKey && futureDateKeys.includes(currentDateKey)
            ? currentDateKey
            : futureDateKeys[0] || ''
        ));
      } catch (error) {
        console.error('Error fetching venue details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleSlot = (slot) => {
    if (slot.status !== 'available') return;
    
    if (selectedSlots.find(s => s._id === slot._id)) {
      setSelectedSlots(selectedSlots.filter(s => s._id !== slot._id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleProceed = () => {
    if (selectedSlots.length > 0) {
      navigate(`/book/${id}`, { state: { selectedSlots, venue } });
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading venue details...</div>;
  if (!venue) return <div className="pt-24 text-center">Venue not found.</div>;

  const venueImage = getVenueImage(venue);
  const slotsByDate = availableSlots.reduce((groups, slot) => {
    const dateKey = getDateKey(slot.date);
    if (!dateKey || isPastDateKey(dateKey) || isPastSlotForToday(slot)) return groups;

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(slot);
    return groups;
  }, {});
  const dateOptions = Object.keys(slotsByDate).sort().map((dateKey) => ({
    dateKey,
    slots: slotsByDate[dateKey].sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || ''))),
    availableCount: slotsByDate[dateKey].filter(isBookableSlot).length
  }));
  const selectedDateSlots = selectedDateKey ? slotsByDate[selectedDateKey] || [] : [];
  const selectedDateAvailableSlots = selectedDateSlots.filter(isBookableSlot);
  const selectedDateLabel = formatDateLabel(selectedDateKey);
  const selectDate = (dateKey) => {
    if (dateKey !== selectedDateKey) {
      setSelectedSlots([]);
      setSelectedDateKey(dateKey);
    }
  };
  const renderDateSelector = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar -mx-1 px-1 max-w-full">
      {dateOptions.map(({ dateKey, availableCount }) => {
        const isActive = selectedDateKey === dateKey;

        return (
          <button
            key={dateKey}
            type="button"
            onClick={() => selectDate(dateKey)}
            className={`min-w-[118px] rounded-2xl border px-4 py-3 text-left transition ${
              isActive
                ? 'bg-[#39FF14] text-black border-[#39FF14]'
                : 'bg-black/40 text-gray-400 border-white/5 hover:border-[#39FF14]/50'
            }`}
          >
            <span className="block text-xs font-black uppercase tracking-widest">{formatDateLabel(dateKey)}</span>
            <span className={`block text-[10px] font-bold uppercase mt-1 ${isActive ? 'text-black/60' : 'text-gray-600'}`}>
              {availableCount} available
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
      <div className="pb-32 md:pb-24 overflow-x-hidden">
      {/* Hero Image & Overlay */}
      <div className="w-full h-[35vh] sm:h-[45vh] md:h-[60vh] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#182033] via-[#101827] to-[#0a0f1c] flex items-center justify-center">
          <span className="text-[#39FF14] text-xs md:text-sm font-black uppercase tracking-[0.35em]">PlayNow Venue</span>
        </div>
        {venueImage && (
          <img
            src={venueImage}
            alt={venue.name}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="relative z-10 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 z-30 w-full p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 md:gap-4"
          >
            <div className="flex flex-wrap gap-2 max-w-full">
              <span className="bg-[#39FF14] text-black px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest shadow-lg max-w-full truncate">
                {formatSportTypes(venue.sportTypes) || 'Sport'}
              </span>
              <span className={`px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest border backdrop-blur-md ${venue.isActive ? 'bg-[#0a0f1c]/60 text-white border-white/10' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}>
                {venue.isActive ? 'Open' : 'Maintenance'}
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter break-words">{venue.name}</h1>
            <p className="text-gray-300 flex items-start text-xs md:text-lg font-medium opacity-90">
              <MapPin size={18} className="mr-2 mt-0.5 text-[#39FF14] shrink-0" /> <span className="break-words">{formatVenueLocation(venue)}</span>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            
            {/* Quick Stats (Mobile only/Desktop compact) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
               <div className="bg-[#151b2b] p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <Star size={24} className="text-[#39FF14] mb-2" fill="currentColor" />
                  <span className="text-lg font-black">{venue.rating || 5}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Rating</span>
               </div>
               <div className="bg-[#151b2b] p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <Clock size={24} className="text-[#39FF14] mb-2" />
                  <span className="text-base md:text-lg font-black">6 AM - 11 PM</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Timing</span>
               </div>
               <div className="bg-[#151b2b] p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <CheckCircle size={24} className="text-[#39FF14] mb-2" />
                  <span className="text-lg font-black">{venue.amenities?.length || 0}+</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Amenities</span>
               </div>
               <div className="bg-[#151b2b] p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <Info size={24} className="text-[#39FF14] mb-2" />
                  <span className="text-lg font-black">Verified</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Status</span>
               </div>
            </div>

            {/* About Section */}
            <section className="bg-[#151b2b] p-6 md:p-10 rounded-[2rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <Info size={120} />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-6 flex items-center">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> About Venue
              </h2>
              <p className="text-gray-400 leading-relaxed font-medium text-sm md:text-lg">{venue.description || venue.about || "Experience world-class sporting facilities designed for high-performance athletes and casual enthusiasts alike. Our venue features professional-grade surfaces and top-tier amenities to ensure you have the best play session."}</p>
            </section>

            {/* Amenities Section */}
            <section className="bg-[#151b2b] p-6 md:p-10 rounded-[2rem] border border-white/5">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-8 flex items-center">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(venue.amenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-300 bg-black/40 p-3 md:p-4 rounded-2xl border border-white/5 font-bold text-xs md:text-sm min-w-0">
                    <CheckCircle size={18} className="text-[#39FF14] mr-3 shrink-0" />
                    <span className="uppercase tracking-tight break-words">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-[#151b2b] p-6 md:p-10 rounded-[2rem] border border-white/5">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center">
                  <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> Player Reviews
                </h2>
                <div className="flex items-center bg-black/40 px-4 md:px-5 py-3 rounded-2xl border border-white/5 shadow-inner w-full md:w-auto justify-center md:justify-start">
                  <Star size={20} className="text-[#39FF14] mr-2" fill="currentColor" />
                  <span className="font-black text-xl">{venue.rating ?? 5}</span>
                  <span className="text-gray-500 ml-2 font-bold text-xs uppercase tracking-tighter">({venue.reviewsCount ?? 0} reviews)</span>
                </div>
              </div>

              {/* Submit form — shown only when logged in and has no existing review */}
              {user && !userReview && (
                <form onSubmit={handleSubmitReview} className="mb-8 bg-black/30 rounded-2xl border border-white/10 p-5 md:p-6 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-300">Write a Review</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs text-gray-500 font-bold uppercase">Your Rating</span>
                    <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} size={22} />
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="Share your experience (optional, max 500 chars)…"
                    maxLength={500}
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-[#39FF14]/50 transition"
                  />
                  {reviewError && <p className="text-red-400 text-xs font-bold">{reviewError}</p>}
                  {reviewSuccess && <p className="text-[#39FF14] text-xs font-bold">{reviewSuccess}</p>}
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#39FF14] text-black font-black text-xs uppercase tracking-wider sm:tracking-widest px-6 py-3 rounded-xl hover:bg-[#32E612] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Login prompt */}
              {!user && (
                <div className="mb-8 bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-center">
                  <p className="text-gray-400 text-sm font-medium">
                    <button onClick={() => navigate('/login')} className="text-[#39FF14] font-black hover:underline">Log in</button>{' '}
                    to write a review for this venue.
                  </p>
                </div>
              )}

              {/* Review list */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((s) => (
                    <div key={s} className="bg-black/20 rounded-2xl border border-white/5 p-6 animate-pulse">
                      <div className="h-3 w-32 bg-white/10 rounded mb-3" />
                      <div className="h-3 w-full bg-white/5 rounded mb-2" />
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : (Array.isArray(reviews) && reviews.length === 0) ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                  <Star size={36} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No reviews yet</p>
                  <p className="text-gray-600 text-xs mt-1">Be the first to review this venue!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {(Array.isArray(reviews) ? reviews : []).map((review) => {
                    const isOwn = review.userId?._id === user?.id || review.userId?._id === user?._id;
                    const isAdmin = user?.role === 'admin';
                    const isEditing = editingReview === review._id;
                    const reviewDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    });

                    return (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/20 p-5 md:p-6 rounded-2xl border border-white/5"
                      >
                        {/* Review header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-3">
                          <div>
                            <div className="font-black text-sm uppercase tracking-wider">
                              {review.userId?.name || 'Anonymous'}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 flex items-center gap-2 flex-wrap">
                              <CheckCircle size={10} className="text-[#39FF14]" />
                              {review.verifiedVisit ? 'Verified Visit' : 'Verified Player'}
                              <span className="text-gray-700">·</span>
                              {reviewDate}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {!isEditing && <StarRating value={review.rating} readonly size={13} />}
                            {(isOwn || isAdmin) && !isEditing && (
                              <div className="flex gap-1 ml-1">
                                {isOwn && (
                                  <button
                                    onClick={() => handleStartEdit(review)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                                    title="Edit review"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  disabled={deletingId === review._id}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition disabled:opacity-50"
                                  title="Delete review"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit mode */}
                        {isEditing ? (
                          <div className="space-y-3 mt-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <span className="text-xs text-gray-500 font-bold uppercase">Rating</span>
                              <StarRating
                                value={editForm.rating}
                                onChange={(v) => setEditForm((f) => ({ ...f, rating: v }))}
                                size={20}
                              />
                            </div>
                            <textarea
                              value={editForm.comment}
                              onChange={(e) => setEditForm((f) => ({ ...f, comment: e.target.value }))}
                              maxLength={500}
                              rows={3}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-[#39FF14]/50 transition"
                            />
                            {reviewError && <p className="text-red-400 text-xs font-bold">{reviewError}</p>}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleUpdateReview(review._id)}
                                disabled={editSubmitting}
                                className="flex items-center gap-1 bg-[#39FF14] text-black font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-[#32E612] transition disabled:opacity-60"
                              >
                                <Send size={12} />{editSubmitting ? 'Saving…' : 'Save Changes'}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-white/20 transition"
                              >
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          review.comment && (
                            <p className="text-gray-400 text-sm font-medium leading-relaxed italic mt-2">"{review.comment}"</p>
                          )
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>


          </div>

          {/* Booking Panel - Hidden on Mobile, Sticky on Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#151b2b] p-8 rounded-[2.5rem] border border-white/5 sticky top-24 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#39FF14]" />
              <h3 className="text-xl font-black uppercase tracking-widest mb-1">Book Your Slot</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Ready for the game?</p>
              
              <div className="flex items-center mb-8 text-[#39FF14] bg-[#39FF14]/5 p-5 rounded-2xl border border-[#39FF14]/20 shadow-inner">
                <Clock size={24} className="mr-3" />
                <div>
                  <span className="text-2xl font-black block">₹{venue.pricePerHour}</span>
                  <span className="text-[10px] uppercase font-black opacity-60">Per Hour</span>
                </div>
              </div>

              <div className="mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Select Timing</h4>
                {dateOptions.length > 0 && renderDateSelector()}
                <div className="grid grid-cols-2 gap-3">
                  {dateOptions.length === 0 || selectedDateAvailableSlots.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center">
                      <p className="text-sm font-black uppercase tracking-widest text-gray-300">No slots available for this date</p>
                      <p className="mt-2 text-xs text-gray-500">Please choose another date or try another venue.</p>
                    </div>
                  ) : selectedDateAvailableSlots.map((slot, i) => {
                    const isSelected = selectedSlots.find(s => s._id === slot._id);
                    const isLocked = slot.status === 'locked';
                    const isBooked = slot.status === 'booked';
                    const isBlocked = slot.status === 'blocked';
                    
                    return (
                      <button
                        key={slot._id || i}
                        onClick={() => toggleSlot(slot)}
                        disabled={isBooked || isBlocked || !venue.isActive}
                        className={`py-4 rounded-2xl text-sm font-black transition-all border flex flex-col items-center justify-center btn-touch relative overflow-hidden ${
                          isSelected 
                            ? 'bg-[#39FF14] text-black border-white ring-4 ring-[#39FF14]/35 shadow-[0_0_30px_rgba(57,255,20,0.65)] scale-[1.03]' 
                            : isLocked
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50 cursor-not-allowed opacity-80'
                            : isBooked
                            ? 'bg-gray-800/40 text-gray-600 border-gray-800 cursor-not-allowed'
                            : isBlocked
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 cursor-not-allowed'
                            : 'bg-black/40 text-gray-400 border-white/5 hover:border-[#39FF14]/50'
                        }`}
                      >
                        <span className="uppercase tracking-tighter">{formatSlotRange(slot)}</span>
                        {isLocked && <span className="text-[8px] uppercase font-black animate-pulse mt-1">Locked</span>}
                        {isBooked && <span className="text-[8px] uppercase font-black mt-1">Sold Out</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Booking Summary */}
              <AnimatePresence>
                {selectedSlots.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="border-t border-white/5 pt-6 mb-8"
                  >
                    <div className="flex justify-between items-center mb-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                      <span>{selectedSlots.length} Slots</span>
                      <span>₹{venue.pricePerHour * selectedSlots.length}</span>
                    </div>
                    <div className="flex justify-between items-center font-black text-xl text-white">
                      <span className="uppercase tracking-tighter">Total</span>
                      <span className="text-[#39FF14]">₹{venue.pricePerHour * selectedSlots.length}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleProceed}
                disabled={selectedSlots.length === 0}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all btn-touch shadow-xl ${
                  selectedSlots.length > 0 
                    ? 'bg-[#39FF14] text-black hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]' 
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                PROCEED TO PAY
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 w-full glass-mobile border-t border-white/10 px-4 py-4 z-40 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Selected Slots</span>
              <span className="text-lg sm:text-xl font-black text-[#39FF14] tracking-tighter">
              ₹{selectedSlots.length > 0 ? venue.pricePerHour * selectedSlots.length : venue.pricePerHour}
              {selectedSlots.length === 0 && <span className="text-[10px] text-gray-400 ml-1">/ hr</span>}
            </span>
          </div>
          <button 
            onClick={() => {
              if (selectedSlots.length > 0) handleProceed();
              else {
                document.getElementById('mobile-slot-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all btn-touch shadow-xl ${
              selectedSlots.length > 0 
                ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)]' 
                : 'bg-white/10 text-white'
            }`}
          >
            {selectedSlots.length > 0 ? 'BOOK NOW' : 'SELECT SLOTS'}
          </button>
        </div>
      </div>

      {/* Mobile Slot Anchor for scrolling */}
      <div id="mobile-slot-anchor" className="lg:hidden px-4 mt-8 pb-32">
         <div className="bg-[#151b2b] p-4 sm:p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-lg font-black uppercase tracking-wider mb-1">Select Slots</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-6 tracking-widest">
              Available {selectedDateLabel || 'Slots'}
            </p>
            {dateOptions.length > 0 && renderDateSelector()}
             <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3">
               {dateOptions.length === 0 || selectedDateAvailableSlots.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-gray-300">No slots available for this date</p>
                    <p className="mt-2 text-xs text-gray-500">Please choose another date or try another venue.</p>
                  </div>
               ) : selectedDateAvailableSlots.map((slot, i) => {
                  const isSelected = selectedSlots.find(s => s._id === slot._id);
                  const isLocked = slot.status === 'locked';
                  const isBooked = slot.status === 'booked';
                  const isBlocked = slot.status === 'blocked';
                  
                  return (
                    <button
                      key={slot._id || i}
                      onClick={() => toggleSlot(slot)}
                      disabled={isBooked || isBlocked || !venue.isActive}
                      className={`py-4 px-2 rounded-2xl text-xs font-black transition-all border flex flex-col items-center justify-center btn-touch relative overflow-hidden ${
                        isSelected 
                          ? 'bg-[#39FF14] text-black border-white ring-4 ring-[#39FF14]/35 shadow-[0_0_24px_rgba(57,255,20,0.55)] scale-[1.03]' 
                          : isLocked
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50 cursor-not-allowed opacity-80'
                          : isBooked
                          ? 'bg-gray-800/40 text-gray-600 border-gray-800 cursor-not-allowed'
                          : isBlocked
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 cursor-not-allowed'
                          : 'bg-black/40 text-gray-400 border-white/5 hover:border-[#39FF14]/50'
                      }`}
                    >
                      <span className="uppercase tracking-tighter text-center break-words">{formatSlotRange(slot)}</span>
                    </button>
                  );
                })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default VenueDetail;
