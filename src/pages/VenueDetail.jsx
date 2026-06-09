import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const UPCOMING_SLOT_DAYS = 30;
const getVenueImage = (venue) => (venue.images || []).find((image) => image && !image.includes('default-venue'));

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

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [venue, setVenue] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">
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
    <div className="pb-32 md:pb-24">
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
        
        <div className="absolute bottom-0 left-0 z-30 w-full p-4 md:p-12 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 md:gap-4"
          >
            <div className="flex gap-2">
              <span className="bg-[#39FF14] text-black px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                {venue.sportTypes?.join(', ') || 'Sport'}
              </span>
              <span className={`px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest border backdrop-blur-md ${venue.isActive ? 'bg-[#0a0f1c]/60 text-white border-white/10' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}>
                {venue.isActive ? 'Open' : 'Maintenance'}
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter">{venue.name}</h1>
            <p className="text-gray-300 flex items-center text-xs md:text-lg font-medium opacity-90">
              <MapPin size={18} className="mr-2 text-[#39FF14]" /> {venue.location}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            
            {/* Quick Stats (Mobile only/Desktop compact) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-[#151b2b] p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <Star size={24} className="text-[#39FF14] mb-2" fill="currentColor" />
                  <span className="text-lg font-black">{venue.rating || 5}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Rating</span>
               </div>
               <div className="bg-[#151b2b] p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <Clock size={24} className="text-[#39FF14] mb-2" />
                  <span className="text-lg font-black">6 AM - 11 PM</span>
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
                  <div key={index} className="flex items-center text-gray-300 bg-black/40 p-4 rounded-2xl border border-white/5 font-bold text-xs md:text-sm">
                    <CheckCircle size={18} className="text-[#39FF14] mr-3 shrink-0" />
                    <span className="uppercase tracking-tight">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-[#151b2b] p-6 md:p-10 rounded-[2rem] border border-white/5">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center">
                  <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> Player Reviews
                </h2>
                <div className="flex items-center bg-black/40 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                  <Star size={20} className="text-[#39FF14] mr-2" fill="currentColor" />
                  <span className="font-black text-xl">{venue.rating || 5}</span>
                  <span className="text-gray-500 ml-2 font-bold text-xs uppercase tracking-tighter">({venue.reviewsCount || 0} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {[1].map((_, i) => (
                  <div key={i} className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-black text-sm uppercase tracking-wider">Arjun P.</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Verified Player</div>
                      </div>
                      <div className="flex text-[#39FF14] gap-0.5">
                        <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed italic">"Great turf, well maintained and lighting is perfect for night matches. The staff is very cooperative. Highly recommended for weekend games!"</p>
                  </div>
                ))}
              </div>
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
                    <div className="col-span-2 rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center">
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
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Selected Slots</span>
            <span className="text-xl font-black text-[#39FF14] tracking-tighter">
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
            className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all btn-touch shadow-xl ${
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
         <div className="bg-[#151b2b] p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-lg font-black uppercase tracking-widest mb-1">Select Slots</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-6 tracking-widest">
              Available {selectedDateLabel || 'Slots'}
            </p>
            {dateOptions.length > 0 && renderDateSelector()}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               {dateOptions.length === 0 || selectedDateAvailableSlots.length === 0 ? (
                  <div className="col-span-2 sm:col-span-3 rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center">
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
                      className={`py-4 rounded-2xl text-xs font-black transition-all border flex flex-col items-center justify-center btn-touch relative overflow-hidden ${
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
                      <span className="uppercase tracking-tighter">{formatSlotRange(slot)}</span>
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
