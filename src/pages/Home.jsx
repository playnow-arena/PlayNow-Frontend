import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Trophy, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sportsList, mockHostedMatches } from '../data/mockData';
import VenueCard from '../components/VenueCard';
import QuotesSlider from '../components/QuotesSlider';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const getVenueImage = (venue) => (venue.images || []).find((image) => image && !image.includes('default-venue'));

const MotionLink = motion(Link);

const Home = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const phrases = ["book courts.", "host matches.", "find players.", "play now."];
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/venues`);
        const data = await res.json();
        setVenues(Array.isArray(data) ? data.slice(0, 3) : []);
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
      <section className="relative pt-24 pb-16 px-4 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 z-0 bg-gradient-energetic opacity-90" />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-[#39FF14] rounded-full blur-[120px] md:blur-[180px] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
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
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.05] drop-shadow-2xl"
            >
              Book Courts. <br className="hidden sm:block" />
              <span className="text-[#39FF14]">Host Matches.</span><br />
              Play Now.
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
              className="text-sm sm:text-base md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto px-4 leading-relaxed mb-10"
            >
              Join the elite sports community. Verified players, premium venues, and hassle-free bookings.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } } }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0"
            >
              <MotionLink 
                to="/venues" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-full sm:w-auto bg-[#39FF14] text-black font-black text-lg md:text-xl rounded-full py-4 px-10 hover:bg-[#32E612] transition-all shadow-[0_0_30px_rgba(57,255,20,0.5)] btn-touch flex items-center justify-center"
              >
                Find a Court
              </MotionLink>
              <MotionLink 
                to="/host-match" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-full sm:w-auto bg-white/10 text-white font-bold text-lg md:text-xl rounded-full py-4 px-10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all btn-touch flex items-center justify-center"
              >
                Host a Match
              </MotionLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 md:mt-16 min-h-[3rem] md:min-h-[5rem] flex flex-wrap items-center justify-center w-full gap-2 sm:gap-3 px-4"
            >
              <span className="text-xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                The advanced Way to
              </span>
              <div className="relative h-10 md:h-20 w-[150px] sm:w-[250px] md:w-[380px] flex items-center justify-start overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentPhrase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-xl sm:text-3xl md:text-6xl font-black text-[#39FF14] absolute tracking-tighter whitespace-nowrap"
                  >
                    {phrases[currentPhrase]}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-20">

        {/* Featured Venues */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                duration: 0.6, 
                ease: "easeOut",
                staggerChildren: 0.1
              } 
            }
          }}
        >
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase">Featured Venues</h2>
            <MotionLink 
              to="/venues" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="text-[#39FF14] text-sm font-black flex items-center hover:underline uppercase tracking-tighter"
            >
              View All <ArrowRight size={14} className="ml-1" />
            </MotionLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-gray-500">Loading featured venues...</div>
            ) : venues.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-[#151b2b] rounded-3xl border border-dashed border-white/10">
                <p className="text-gray-300 font-bold">No venues found</p>
                <p className="text-gray-500 text-sm mt-2">New venues will appear here once they are added.</p>
              </div>
            ) : venues.map((venue, index) => (
              <VenueCard key={venue._id || index} venue={venue} index={index} showAmenities={false} delayMultiplier={0.1} isCompact={true} />
            ))}
          </div>
        </motion.section>

        {/* Marketing Discovery / Host Match Callout */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
          className="relative group"
        >
          {/* Neon Glow Ambient Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#39FF14]/20 to-transparent rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />

          <div className="relative bg-[#151b2b]/40 backdrop-blur-xl border border-white/10 group-hover:border-[#39FF14]/30 rounded-[2rem] p-8 md:p-12 transition-all duration-500 overflow-hidden">
            {/* Decorative Grid Pattern or Blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#39FF14]/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-3xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-xs font-black uppercase tracking-widest">
                  <Users size={12} className="animate-pulse" /> PLAYER DISCOVERY
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-white">
                  Never Run Short <br className="hidden sm:block" /> of <span className="text-[#39FF14] text-gradient">Players</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-medium max-w-xl">
                  Post your game on PlayNow and get players from across your neighbourhood to join and make your game happen.
                </p>
              </div>

              <div className="w-full lg:w-auto flex-shrink-0">
                <MotionLink 
                  to="/host-match" 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-[#39FF14] text-black font-black text-lg md:text-xl rounded-2xl py-4 px-10 hover:bg-[#32E612] transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_35px_rgba(57,255,20,0.7)] btn-touch uppercase tracking-wider group/btn"
                >
                  Host a Match
                  <ArrowRight size={20} className="transform group-hover/btn:translate-x-1 transition-transform" />
                </MotionLink>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Hosted Matches */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                duration: 0.6, 
                ease: "easeOut",
                staggerChildren: 0.1
              } 
            }
          }}
        >
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Join Stranger Matches</h2>
            <MotionLink 
              to="/host-match" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="text-[#39FF14] font-medium flex items-center hover:underline"
            >
              Host Match <ArrowRight size={16} className="ml-1" />
            </MotionLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockHostedMatches.map((match) => (
              <motion.div
                key={match.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } }
                }}
                whileHover={{ y: -4, scale: 1.015, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="bg-gradient-to-r from-[#151b2b] to-[#1a233a] p-4 sm:p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4 md:gap-6 items-center shadow-lg w-full"
              >
                <div className="w-full md:w-1/3 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-2 p-3 sm:p-4 bg-[#0a0f1c] rounded-xl border border-gray-800">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-[#39FF14] md:hidden" />
                    <Users size={30} className="text-[#39FF14] hidden md:block" />
                  </div>
                  <div className="text-left md:text-center">
                    <span className="text-xs font-medium text-gray-500 block">Host</span>
                    <span className="font-bold text-base md:text-lg block leading-tight">{match.hostName}</span>
                  </div>
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
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      Join Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>

      {/* Quotes Slider — full width, outside padded container */}
      <div className="mt-12 md:mt-20">
        <QuotesSlider />
      </div>

      {/* How It Works */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              duration: 0.6, 
              ease: "easeOut",
              staggerChildren: 0.15
            } 
          }
        }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20 pb-12"
      >
        <section className="bg-gradient-energetic rounded-3xl p-8 md:p-12 border border-[#39FF14]/20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 w-64 h-64">
            <Trophy size={256} />
          </div>
          <h2 className="text-3xl font-bold mb-10 text-center relative z-10">How Play Now Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } }
              }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
                <Search size={32} className="text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Find &amp; Book</h3>
              <p className="text-gray-400">Discover premium venues around you and book your slot instantly.</p>
            </motion.div>
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } }
              }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} className="text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Host &amp; Join</h3>
              <p className="text-gray-400">Short on players? Host a match and let strangers join and split the cost.</p>
            </motion.div>
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } }
              }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Players</h3>
              <p className="text-gray-400">No fake bookings. 100% verified players with PlayNow IDs ensuring safe games.</p>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Home;
