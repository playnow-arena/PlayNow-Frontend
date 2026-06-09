import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { sportsList } from '../data/mockData';
import VenueCard from '../components/VenueCard';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/venues`);
        const data = await res.json();
        setVenues(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const filteredVenues = venues.filter(venue => {
    const matchesSport = filterSport === 'All' || venue.sportTypes?.includes(filterSport);
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="pt-20 md:pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Explore Venues</h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Find and book the best sports spots around you.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151b2b] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/5 transition-all"
          />
        </div>
      </div>

      {/* Sport Filters - Horizontal Scroll on Mobile */}
      <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-8 md:mb-10 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <button 
          onClick={() => setFilterSport('All')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all btn-touch ${filterSport === 'All' ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'bg-[#151b2b] text-gray-500 border border-white/5 hover:border-[#39FF14]/30'}`}
        >
          All Sports
        </button>
        {sportsList.map(sport => (
          <button 
            key={sport.id}
            onClick={() => setFilterSport(sport.name)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all btn-touch ${filterSport === sport.name ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'bg-[#151b2b] text-gray-400 border border-white/5 hover:border-[#39FF14]/30'}`}
          >
            {sport.name}
          </button>
        ))}
      </div>

      {/* Venue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Venues...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#151b2b] rounded-[2rem] border border-dashed border-white/10">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No venues found matching your criteria</p>
            <button onClick={() => {setFilterSport('All'); setSearchQuery('');}} className="mt-4 text-[#39FF14] font-black uppercase text-xs hover:underline">Clear filters</button>
          </div>
        ) : filteredVenues.map((venue, index) => (
          <VenueCard key={venue._id || index} venue={venue} index={index} showAmenities={true} delayMultiplier={0.05} isCompact={false} />
        ))}
      </div>
    </div>
  );
};

export default Venues;
