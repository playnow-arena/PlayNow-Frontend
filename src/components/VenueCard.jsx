import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeSportName } from '../utils/sports';

const MotionLink = motion(Link);
const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' • ') || venue?.location || 'Location unavailable'
);

const VenueCard = ({ venue, index, showAmenities = false, delayMultiplier = 0.05, isCompact = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: isCompact ? 0.6 : 0.5, delay: index * delayMultiplier, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={`w-full min-w-0 bg-[#151b2b] overflow-hidden border border-white/5 hover:border-[#39FF14]/50 transition-colors group cursor-pointer shadow-xl ${isCompact ? 'rounded-3xl' : 'rounded-[2rem] shadow-2xl'}`}
    >
      <div className={`relative overflow-hidden ${isCompact ? 'h-48 md:h-52' : 'h-52 md:h-56'}`}>
        <img src={venue.images?.[0] || '/default-venue.jpg'} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Rating Badge */}
        <div className={`absolute bg-black/70 backdrop-blur-md rounded-full text-xs font-black flex items-center border border-white/10 shadow-lg ${isCompact ? 'top-3 right-3 px-3 py-1' : 'top-4 right-4 px-3 py-1.5'}`}>
          ⭐ {venue.rating || 5} {!isCompact && venue.reviewsCount !== undefined && <span className="text-gray-500 ml-1 font-bold">({venue.reviewsCount})</span>}
        </div>
        
        {/* Bottom Badges */}
        <div className={`absolute flex flex-wrap gap-2 max-w-[calc(100%-1.5rem)] ${isCompact ? 'bottom-3 left-3' : 'bottom-4 left-4 right-3'}`}>
          <span className={`max-w-full truncate bg-[#39FF14] text-black rounded-full text-[10px] font-black uppercase ${isCompact ? 'px-3 py-1' : 'px-4 py-1.5 shadow-[0_4px_10px_rgba(57,255,20,0.4)]'}`}>
            {normalizeSportName(venue.sportTypes?.[0]) || 'Sport'}
          </span>
          {!isCompact && venue.isActive !== undefined && (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border backdrop-blur-md ${venue.isActive ? 'bg-[#0a0f1c]/80 text-white border-white/10' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
              {venue.isActive ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
      </div>
      
      <div className={isCompact ? 'p-4 sm:p-5 md:p-6' : 'p-4 sm:p-6 md:p-8'}>
        <div className="flex justify-between items-start gap-3 mb-3 md:mb-4 min-w-0">
          <h3 className={`${isCompact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-black leading-tight min-w-0 break-words line-clamp-2 pr-1 md:pr-4`}>{venue.name}</h3>
          <div className="text-right shrink-0">
            <span className={`text-[#39FF14] font-black ${isCompact ? 'text-lg' : 'text-2xl'}`}>₹{venue.pricePerHour}</span>
            <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-tighter">/ hour</span>
          </div>
        </div>
        <p className={`text-gray-400 text-sm flex items-start font-medium min-w-0 ${isCompact ? 'mb-5 text-xs md:text-sm' : 'mb-6'}`}>
          <MapPin size={isCompact ? 14 : 16} className={`text-gray-600 shrink-0 mt-0.5 ${isCompact ? 'mr-1' : 'mr-2'}`} />
          <span className="min-w-0 break-words">{formatVenueLocation(venue)}</span>
        </p>

        {/* Amenities (Only visible if showAmenities is true) */}
        {showAmenities && venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {venue.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="text-[10px] bg-black/40 text-gray-400 px-3 py-1.5 rounded-lg border border-white/5 font-bold uppercase tracking-wider">
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[10px] bg-black/40 text-gray-400 px-3 py-1.5 rounded-lg border border-white/5 font-bold uppercase">
                +{venue.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <MotionLink 
          to={`/venues/${venue._id}`} 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`block w-full text-center bg-white/5 hover:bg-[#39FF14] hover:text-black text-white rounded-2xl transition-all font-black text-sm uppercase btn-touch ${isCompact ? 'py-3 tracking-widest' : 'py-4 tracking-widest sm:tracking-[0.2em] shadow-xl'}`}
        >
          {isCompact ? 'Book Slot' : 'VIEW & BOOK'}
        </MotionLink>
      </div>
    </motion.div>
  );
};

export default VenueCard;
