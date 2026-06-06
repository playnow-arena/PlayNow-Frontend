import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { sportsList, mockHostedMatches } from '../data/mockData';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const Home = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/venues`);
        const data = await res.json();
        setVenues(Array.isArray(data) ? data.slice(0, 3) : []); // Get top 3 for home
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="pb-24 md:pb-10">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-energetic opacity-80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#39FF14] rounded-full blur-[150px] opacity-10" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 leading-[1.1]">
              Book Courts. <br className="hidden sm:block" />
              <span className="text-gradient">Host Matches.</span><br />
              Play Now.
            </h1>
            <p className="text-sm md:text-xl text-gray-400 mb-0 max-w-2xl mx-auto px-4">
              Join the elite sports community. Verified players, premium venues, and hassle-free bookings.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto glass-mobile p-3 md:p-4 rounded-3xl md:rounded-2xl border border-white/10 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="flex items-center bg-black/40 rounded-2xl px-4 py-3 border border-white/5 focus-within:border-[#39FF14] transition-all">
                <Search size={18} className="text-[#39FF14] mr-3 shrink-0" />
                <input type="text" placeholder="Search sport..." className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-500" />
              </div>
              <div className="flex items-center bg-black/40 rounded-2xl px-4 py-3 border border-white/5 focus-within:border-[#39FF14] transition-all">
                <MapPin size={18} className="text-[#39FF14] mr-3 shrink-0" />
                <input type="text" placeholder="Location" className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-500" />
              </div>
              <div className="flex items-center bg-black/40 rounded-2xl px-4 py-3 border border-white/5 focus-within:border-[#39FF14] transition-all">
                <Calendar size={18} className="text-[#39FF14] mr-3 shrink-0" />
                <input type="text" placeholder="Date" className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-500" />
              </div>
              <button className="bg-[#39FF14] text-black font-black rounded-2xl py-3.5 px-6 hover:bg-[#32E612] transition-all btn-touch flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                FIND VENUES
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-20">
        
        {/* Popular Sports - Horizontal Scroll on Mobile */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase">Popular Sports</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pb-4 md:pb-0">
            {sportsList.map((sport, index) => (
              <motion.div 
                key={sport.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-[#151b2b] p-5 md:p-6 rounded-2xl border border-white/5 text-center cursor-pointer hover:border-[#39FF14]/50 transition-all group btn-touch"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto ${sport.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Trophy size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-sm md:text-base tracking-tight">{sport.name}</h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Venues */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase">Featured Venues</h2>
            <Link to="/venues" className="text-[#39FF14] text-sm font-black flex items-center hover:underline uppercase tracking-tighter">
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-gray-500">Loading featured venues...</div>
            ) : venues.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500">No venues available yet.</div>
            ) : venues.map((venue, index) => (
              <motion.div 
                key={venue._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#151b2b] rounded-3xl overflow-hidden border border-white/5 hover:border-[#39FF14]/30 transition-all group cursor-pointer shadow-xl"
              >
                <div className="h-48 md:h-52 relative overflow-hidden">
                  <img src={venue.images?.[0] || '/default-venue.jpg'} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black flex items-center border border-white/10">
                    ⭐ {venue.rating || 5}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {venue.sportTypes?.[0] || 'Sport'}
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg md:text-xl font-black leading-tight truncate pr-2">{venue.name}</h3>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[#39FF14] font-black text-lg">₹{venue.pricePerHour}</span>
                      <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-tighter">/ hour</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm flex items-center mb-5 font-medium">
                    <MapPin size={14} className="mr-1 text-gray-600" /> {venue.location}
                  </p>
                  <Link to={`/venues/${venue._id}`} className="block w-full text-center bg-white/5 hover:bg-[#39FF14] hover:text-black text-white py-3 rounded-2xl transition-all font-black text-sm uppercase tracking-widest btn-touch">
                    Book Slot
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Hosted Matches */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Join Stranger Matches</h2>
            <Link to="/host-match" className="text-[#39FF14] font-medium flex items-center hover:underline">
              Host Match <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockHostedMatches.map((match, index) => (
              <motion.div 
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-r from-[#151b2b] to-[#1a233a] p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-6 items-center"
              >
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 bg-[#0a0f1c] rounded-xl border border-gray-800">
                  <div className="w-16 h-16 bg-gray-800 rounded-full mb-2 flex items-center justify-center">
                    <Users size={30} className="text-[#39FF14]" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Host</span>
                  <span className="font-bold text-lg">{match.hostName}</span>
                </div>
                <div className="w-full md:w-2/3 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{match.sport}</h3>
                      <span className="bg-[#39FF14]/20 text-[#39FF14] px-3 py-1 rounded-full text-xs font-bold">
                        ₹{match.pricePerPlayer} / share
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center mb-1">
                      <MapPin size={14} className="mr-2 text-gray-500" /> {match.venue}
                    </p>
                    <p className="text-gray-400 text-sm flex items-center">
                      <Clock size={14} className="mr-2 text-gray-500" /> {match.date}, {match.time}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="flex -space-x-2 mb-1">
                        {[...Array(match.joinedPlayers)].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-600 border border-[#151b2b]"></div>
                        ))}
                      </div>
                      <span className="text-xs text-[#39FF14] font-medium">{match.playersNeeded} more needed</span>
                    </div>
                    <button className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition">
                      Join Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-energetic rounded-3xl p-8 md:p-12 border border-[#39FF14]/20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 w-64 h-64">
             <Trophy size={256} />
          </div>
          <h2 className="text-3xl font-bold mb-10 text-center relative z-10">How Play Now Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
                <Search size={32} className="text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Find & Book</h3>
              <p className="text-gray-400">Discover premium venues around you and book your slot instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} className="text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Host & Join</h3>
              <p className="text-gray-400">Short on players? Host a match and let strangers join and split the cost.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Players</h3>
              <p className="text-gray-400">No fake bookings. 100% verified players with PlayNow IDs ensuring safe games.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
