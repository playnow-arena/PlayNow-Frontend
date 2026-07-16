import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeSportName } from '../utils/sports';
import { useLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/location';

const MotionLink = motion(Link);
const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' • ') || venue?.location || 'Location unavailable'
);

const VenueCard = ({ venue, index, showAmenities = false, delayMultiplier = 0.05, isCompact = false }) => {
  const { location: userLocation } = useLocation();
  
  const distance = userLocation && venue.geo?.coordinates ? calculateDistance(
    userLocation.lat, userLocation.lng,
    venue.geo.coordinates[1], venue.geo.coordinates[0]
  ) : null;

  return (
      <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03, ease: "easeOut" }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`w-full min-w-0 card overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer shadow-xl ${isCompact ? 'rounded-2xl' : 'rounded-[2rem] shadow-2xl'}`}
    >
      <div className={`relative overflow-hidden ${isCompact ? 'h-48' : 'h-56'}`}>
        <img loading="lazy" src={venue.images?.[0] || '/default-venue.jpg'} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Rating Badge */}
        <div className={`absolute bg-black/70 backdrop-blur-md rounded-full text-xs font-black flex items-center border border-white/10 shadow-lg ${isCompact ? 'top-3 right-3 px-3 py-1' : 'top-4 right-4 px-3 py-1.5'}`}>
          <span className="text-primary mr-1">★</span> {venue.rating || 5} 
          {!isCompact && venue.reviewsCount !== undefined && <span className="text-text-sub ml-1 font-bold">({venue.reviewsCount})</span>}
        </div>
        
        {/* Bottom Badges */}
        <div className={`absolute flex flex-wrap gap-2 max-w-[calc(100%-1.5rem)] ${isCompact ? 'bottom-3 left-3' : 'bottom-4 left-4 right-3'}`}>
          <span className={`max-w-full truncate bg-primary text-black rounded-full text-[10px] font-black uppercase ${isCompact ? 'px-3 py-1' : 'px-4 py-1.5 shadow-[0_4px_10px_rgba(57,255,20,0.4)]'}`}>
            {normalizeSportName(venue.sportTypes?.[0]) || 'Sport'}
          </span>
          {!isCompact && venue.isActive !== undefined && (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border backdrop-blur-md ${venue.isActive ? 'bg-black/80 text-white border-white/10' : 'bg-danger/20 text-danger border-danger/30'}`}>
              {venue.isActive ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
      </div>
      
      <div className={isCompact ? 'p-5' : 'p-8'}>
        <div className="flex justify-between items-start gap-2 mb-4 min-w-0">
          <h3 className={`${isCompact ? 'text-lg' : 'text-xl md:text-2xl'} font-black leading-tight min-w-0 break-words line-clamp-2 pr-2`}>{venue.name}</h3>
          <div className="text-right shrink-0">
            <span className={`text-primary font-black ${isCompact ? 'text-lg' : 'text-xl'}`}>₹{venue.pricePerHour}</span>
            <span className="text-[9px] text-text-sub block font-bold uppercase tracking-tighter">/ hr</span>
          </div>
        </div>
        <p className={`text-text-sub text-xs flex items-start font-medium min-w-0 ${isCompact ? 'mb-5' : 'mb-6'}`}>
          <MapPin size={14} className="text-text-sub shrink-0 mr-2 mt-0.5" />
          <span className="min-w-0 truncate">{formatVenueLocation(venue)}</span>
        </p>

        {/* Distance Display */}
        {distance !== null && (
          <p className="text-primary text-xs font-bold mb-4 flex items-center">
            <MapPin size={12} className="mr-1" />
            {distance.toFixed(1)} km away
          </p>
        )}

        {/* Amenities */}
        {showAmenities && venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {venue.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="text-[9px] bg-bg text-text-sub px-3 py-1 rounded-lg border border-border font-bold uppercase tracking-wider whitespace-nowrap">
                {amenity}
              </span>
            ))}
          </div>
        )}

        <MotionLink 
          to={`/venues/${venue._id}`} 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`block w-full text-center btn-primary rounded-2xl ${isCompact ? 'py-3 text-sm' : 'py-4 text-sm'}`}
        >
          Book Slot
        </MotionLink>
      </div>
    </motion.div>
  );
};

export default React.memo(VenueCard);
