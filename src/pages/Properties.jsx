import React from 'react';
import { Building, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Properties = () => {
  const propertiesList = [
    { id: 1, name: 'Downtown Sports Complex', type: 'Multipurpose', location: 'City Center', rating: 4.8, price: 800 },
    { id: 2, name: 'Greenfield Turf', type: 'Football', location: 'North District', rating: 4.5, price: 1200 },
    { id: 3, name: 'Smash Arena', type: 'Badminton', location: 'South End', rating: 4.9, price: 400 },
  ];

  return (
    <div className="pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Properties</h1>
        <p className="text-gray-400">Explore all available sports properties and venues in your area.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertiesList.map((property) => (
          <motion.div 
            key={property.id}
            whileHover={{ y: -5 }}
            className="bg-[#151b2b] rounded-2xl border border-gray-800 overflow-hidden hover:border-[#39FF14] transition duration-300 shadow-lg group"
          >
            <div className="h-48 bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#151b2b] to-transparent z-10"></div>
              {/* Placeholder image */}
              <div className="absolute inset-0 bg-[#1f2937] flex items-center justify-center">
                <Building size={48} className="text-gray-600 group-hover:scale-110 transition duration-300" />
              </div>
              <div className="absolute top-4 right-4 z-20 bg-[#0a0f1c]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700 flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-white">{property.rating}</span>
              </div>
            </div>
            
            <div className="p-6 relative z-20 -mt-8">
              <div className="bg-[#0a0f1c] inline-block px-3 py-1 rounded-full border border-gray-800 text-xs text-[#39FF14] font-bold mb-3">
                {property.type}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{property.name}</h3>
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <MapPin size={16} className="mr-1 text-[#39FF14]" />
                {property.location}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                <div>
                  <span className="text-gray-400 text-sm">Starts from</span>
                  <div className="text-lg font-bold text-white">₹{property.price}<span className="text-sm text-gray-500 font-normal">/hr</span></div>
                </div>
                <button className="bg-[#39FF14] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Properties;
