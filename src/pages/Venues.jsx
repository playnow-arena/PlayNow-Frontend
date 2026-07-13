import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import VenueCard from '../components/VenueCard';
import { motion } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const SPORT_OPTIONS = [
  'Badminton',
  'Football Turf',
  'Football',
  'Cricket',
  'Cricket Nets',
  'Pickleball',
  'Tennis',
  'Basketball',
  'Table Tennis',
  'Volleyball',
  'Box Cricket',
  'Other'
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any price' },
  { value: 'under-300', label: 'Under ₹300', maxPrice: 299.99 },
  { value: '300-500', label: '₹300 - ₹500', minPrice: 300, maxPrice: 500 },
  { value: '500-800', label: '₹500 - ₹800', minPrice: 500, maxPrice: 800 },
  { value: 'above-800', label: 'Above ₹800', minPrice: 800.01 }
];

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchVenues = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        const selectedPrice = PRICE_OPTIONS.find(option => option.value === priceFilter);

        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filterSport !== 'All') params.set('sport', filterSport);
        if (areaFilter.trim()) params.set('area', areaFilter.trim());
        if (selectedPrice?.minPrice !== undefined) params.set('minPrice', selectedPrice.minPrice);
        if (selectedPrice?.maxPrice !== undefined) params.set('maxPrice', selectedPrice.maxPrice);
        if (ratingFilter) params.set('minRating', ratingFilter);

        const query = params.toString();
        const res = await fetch(
          `${API_BASE_URL}/api/venues${query ? `?${query}` : ''}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error('Failed to load venues');
        }
        const data = await res.json();
        setVenues(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching venues:', error);
        setVenues([]);
        setError('Unable to load venues. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchVenues();
    return () => controller.abort();
  }, [debouncedSearch, filterSport, areaFilter, priceFilter, ratingFilter]);

  const hasActiveFilters = Boolean(
    searchQuery || filterSport !== 'All' || areaFilter || priceFilter || ratingFilter
  );

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterSport('All');
    setAreaFilter('');
    setPriceFilter('');
    setRatingFilter('');
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Explore Venues</h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Find and book the best sports spots around you.</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="relative group w-full md:w-80"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search venue name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151b2b] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/5 transition-all"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-7">
        <input
          type="text"
          value={areaFilter}
          onChange={(event) => setAreaFilter(event.target.value)}
          placeholder="Area or location"
          className="w-full bg-[#151b2b] border border-white/5 rounded-xl px-4 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#39FF14]/60 transition"
        />
        <select
          value={priceFilter}
          onChange={(event) => setPriceFilter(event.target.value)}
          className="w-full bg-[#151b2b] border border-white/5 rounded-xl px-4 py-4 text-sm text-gray-300 focus:outline-none focus:border-[#39FF14]/60 transition appearance-none cursor-pointer"
          aria-label="Filter venues by price"
        >
          {PRICE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          className="w-full bg-[#151b2b] border border-white/5 rounded-xl px-4 py-4 text-sm text-gray-300 focus:outline-none focus:border-[#39FF14]/60 transition appearance-none cursor-pointer"
          aria-label="Filter venues by rating"
        >
          <option value="">Any rating</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3.5">3.5+</option>
        </select>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="flex items-center justify-center gap-2 bg-[#151b2b] border border-white/5 rounded-xl px-5 py-4 text-xs font-black uppercase tracking-wider text-gray-300 hover:border-[#39FF14]/40 hover:text-[#39FF14] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={15} />
          Clear
        </button>
      </div>

      {/* Sport Filters - Horizontal Scroll on Mobile */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
          }
        }}
        className="flex items-center gap-3 overflow-x-auto pb-6 mb-8 md:mb-10 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 max-w-[100vw]"
      >
        <motion.button 
          variants={{
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0 }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFilterSport('All')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all btn-touch ${filterSport === 'All' ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'bg-[#151b2b] text-gray-500 border border-white/5 hover:border-[#39FF14]/30'}`}
        >
          All Sports
        </motion.button>
        {SPORT_OPTIONS.map(sport => (
          <motion.button 
            key={sport}
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterSport(sport)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all btn-touch ${filterSport === sport ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'bg-[#151b2b] text-gray-400 border border-white/5 hover:border-[#39FF14]/30'}`}
          >
            {sport}
          </motion.button>
        ))}
      </motion.div>

      {/* Venue Grid */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 min-w-0"
      >
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Venues...</p>
          </div>
        ) : error ? (
          <div className="col-span-full py-16 md:py-20 px-4 text-center bg-[#151b2b] rounded-[2rem] border border-dashed border-red-500/20">
            <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="col-span-full py-16 md:py-20 px-4 text-center bg-[#151b2b] rounded-[2rem] border border-dashed border-white/10">
            <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">No venues found for your filters</p>
            <button onClick={clearFilters} className="mt-4 text-[#39FF14] font-black uppercase text-xs hover:underline">Clear filters</button>
          </div>
        ) : venues.map((venue, index) => (
          <VenueCard key={venue._id || index} venue={venue} index={index} showAmenities={true} delayMultiplier={0.05} isCompact={false} />
        ))}
      </motion.div>
    </div>
  );
};

export default Venues;
