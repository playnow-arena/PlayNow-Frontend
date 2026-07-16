import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Trophy, Users, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../context/LocationContext';
import VenueCard from '../components/VenueCard';
import NeverRunShortOfPlayers from '../components/NeverRunShortOfPlayers';
import QuotesSlider from '../components/QuotesSlider';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const Home = () => {
  const [venues, setVenues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { location, requestLocation, setLocation } = useLocation();

  const phrases = ["book courts.", "host matches.", "find players.", "playsports."];
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let venuesUrl = `${API_BASE_URL}/api/venues/featured`;
        if (location) {
          venuesUrl += `?lat=${location.lat}&lng=${location.lng}`;
        }
        
        const [venuesRes, matchesRes] = await Promise.all([
          fetch(venuesUrl),
          fetch(`${API_BASE_URL}/api/matches`)
        ]);
        const venuesData = await venuesRes.json();
        const matchesData = await matchesRes.json();
        
        setVenues(Array.isArray(venuesData) ? venuesData : []);
        setMatches(Array.isArray(matchesData) ? matchesData.slice(0, 4) : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location]);

  const locationDisplay = location 
    ? (location.area ? `📍 ${location.city} • ${location.area}` : `📍 ${location.city}`)
    : '📍 Set Location';

  return (
    <div className="pb-24 md:pb-10">
      <section className="relative pt-24 pb-16 px-4 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 z-0 bg-gradient-energetic opacity-90" />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square md:max-w-[900px] bg-[#39FF14] rounded-full blur-[120px] md:blur-[180px] pointer-events-none" 
        />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-right px-4 mb-4">
            <button 
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
            >
              <MapPin size={14} />
              {locationDisplay}
            </button>
          </div>

          {!location && (
            <div className="px-4 mb-8 text-center">
              <button onClick={requestLocation} className="btn-primary text-sm px-6 py-2">
                Enable Location for Better Results
              </button>
            </div>
          )}

          {/* Location Modal */}
          {showLocationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#151b2b] card p-6 w-full max-w-sm rounded-2xl border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Select Location</h3>
                  <button onClick={() => setShowLocationModal(false)}><X /></button>
                </div>
                <button onClick={() => { requestLocation(); setShowLocationModal(false); }} className="w-full btn-secondary mb-4 flex items-center justify-center gap-2">
                  <Navigation size={16} /> Use Current GPS
                </button>
                <div className="border-t border-border pt-4">
                   <p className="text-xs text-text-sub mb-2">Search City (Coming Soon)</p>
                   {/* Manual search implementation */}
                </div>
              </div>
            </div>
          )}
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
            className="text-center mb-10 md:mb-16 flex flex-col items-center"
          >
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.05] drop-shadow-2xl"
            >
              Book Courts. <br className="hidden sm:block" />
              <span className="text-primary">Host Matches.</span><br />
              PlayNow.
            </motion.h1>
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
              className="text-base sm:text-lg md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto px-4 leading-relaxed mb-10"
            >
              Join the elite sports community. Verified players, premium venues, and hassle-free bookings.
            </motion.p>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } } }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0"
            >
              <Link to="/venues" className="w-full sm:w-auto btn-primary text-lg md:text-xl flex items-center justify-center">
                Find a Court
              </Link>
              <Link to="/host-match" className="w-full sm:w-auto bg-white/10 text-white font-bold text-lg md:text-xl rounded-full py-4 px-10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all transform hover:scale-105 btn-touch flex items-center justify-center">
                Host a Match
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 md:mt-16 h-16 md:h-20 flex items-center justify-center w-full gap-3"
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                The advanced Way to
              </span>
              <div className="relative h-16 md:h-20 w-full max-w-[200px] sm:max-w-[250px] md:max-w-[350px] flex items-center justify-start overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentPhrase}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl font-black text-[#39FF14] absolute tracking-tighter whitespace-nowrap"
                  >
                    {phrases[currentPhrase]}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>


        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-20 w-full overflow-x-hidden">
        {/* Featured Venues */}
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase">Featured Venues</h2>
            <Link to="/venues" className="text-primary text-sm font-black flex items-center hover:underline uppercase tracking-tighter">
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-gray-500">Loading featured venues...</div>
            ) : venues.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500">No venues available yet.</div>
            ) : venues.map((venue, index) => (
              <VenueCard key={venue._id || index} venue={venue} index={index} showAmenities={false} delayMultiplier={0.1} isCompact={true} />
            ))}
          </div>
        </section>

        <NeverRunShortOfPlayers />

        {/* Hosted Matches */}
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8">
            <h2 className="text-3xl font-bold">Join Stranger Matches</h2>
            <Link to="/host-match" className="text-[#39FF14] font-medium flex items-center hover:underline">
              Host Match <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, index) => (
              <motion.div 
                key={match._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-4 sm:p-6 border border-border flex flex-col md:flex-row gap-5 md:gap-6 items-center min-w-0"
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <h3 className="text-xl font-bold break-words">{match.sport}</h3>
                      <span className="bg-[#39FF14]/20 text-[#39FF14] px-3 py-1 rounded-full text-xs font-bold">
                        ₹{match.pricePerPlayer} / share
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm flex items-start mb-1">
                      <MapPin size={14} className="mr-2 mt-0.5 text-gray-500 shrink-0" /> <span className="break-words">{match.venue}</span>
                    </p>
                    <p className="text-gray-400 text-sm flex items-start">
                      <Clock size={14} className="mr-2 mt-0.5 text-gray-500 shrink-0" /> <span className="break-words">{new Date(match.date).toLocaleDateString()}, {match.time}</span>
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex -space-x-2 mb-1">
                        {[...Array(match.joinedPlayers || 0)].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-600 border border-[#151b2b]"></div>
                        ))}
                      </div>
                      <span className="text-xs text-[#39FF14] font-medium">{(match.playersNeeded || 0)} more needed</span>
                    </div>
                    <button className="w-full sm:w-auto btn-secondary text-sm px-6 py-2">
                      Join Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="card p-8 md:p-12 border border-primary/20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 w-64 h-64">
             <Trophy size={256} />
          </div>
          <h2 className="text-3xl font-bold mb-10 text-center relative z-10">How PlayNow Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Search size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Find & Book</h3>
              <p className="text-text-sub">Discover premium venues around you and book your slot instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Host & Join</h3>
              <p className="text-text-sub">Short on players? Host a match and let strangers join and split the cost.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Players</h3>
              <p className="text-text-sub">No fake bookings. 100% verified players with PlayNow IDs ensuring safe games.</p>
            </div>
          </div>
        </section>

        <QuotesSlider />

      </div>
    </div>
  );
};

export default Home;
