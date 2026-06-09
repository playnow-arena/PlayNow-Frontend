import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Users, Trophy, MapPin } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="pt-24 pb-20 px-4 md:pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            About <span className="text-[#39FF14]">PlayNow</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Building India's most trusted sports community.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#151b2b] p-8 rounded-3xl border border-white/5"
          >
            <div className="w-14 h-14 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
              <Target className="text-[#39FF14]" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              Help players discover premium sports venues, connect with fellow players, and make sports more accessible to everyone, everywhere.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#151b2b] p-8 rounded-3xl border border-white/5"
          >
            <div className="w-14 h-14 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="text-[#39FF14]" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              Become the default ecosystem for grassroots sports, eliminating the friction between wanting to play and actually stepping onto the court.
            </p>
          </motion.div>
        </div>

        {/* Highlight Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#39FF14]/10 to-transparent border-l-4 border-[#39FF14] p-8 rounded-r-3xl my-12"
        >
          <h3 className="text-2xl font-black mb-2 text-white">Never run short of players.</h3>
          <p className="text-gray-300">
            Post your game on PlayNow and get players from across your neighbourhood to join and make your game happen.
          </p>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-center">Why Choose PlayNow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0f1c] border border-white/5 p-6 rounded-2xl text-center flex flex-col items-center">
              <MapPin className="text-[#39FF14] mb-4" size={32} />
              <h4 className="font-bold mb-2">Easy Booking</h4>
              <p className="text-sm text-gray-500">Find and book the best courts instantly.</p>
            </div>
            <div className="bg-[#0a0f1c] border border-white/5 p-6 rounded-2xl text-center flex flex-col items-center">
              <Users className="text-[#39FF14] mb-4" size={32} />
              <h4 className="font-bold mb-2">Find Players</h4>
              <p className="text-sm text-gray-500">Connect with local players matching your skill.</p>
            </div>
            <div className="bg-[#0a0f1c] border border-white/5 p-6 rounded-2xl text-center flex flex-col items-center">
              <ShieldCheck className="text-[#39FF14] mb-4" size={32} />
              <h4 className="font-bold mb-2">Seamless Experience</h4>
              <p className="text-sm text-gray-500">Secure payments and verified users.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutUs;
