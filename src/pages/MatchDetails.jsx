import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Clock, CheckCircle, Copy, ArrowRight } from 'lucide-react';

// Mock data for demonstration purposes
const mockMatch = {
  id: 'ABC123XY',
  sport: 'Football Turf',
  venue: 'Central Sports Arena',
  date: '2024-12-01',
  time: '18:30',
  players: ['Alice', 'Bob', 'Charlie', 'David'],
};

const MatchDetails = () => {
  const { id, sport, venue, date, time, players } = mockMatch;

  const handleJoin = () => {
    // Placeholder UI action – in a real app this would call an API
    alert('You have joined the match!');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center bg-[#0a0f1c]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#151b2b]/80 backdrop-blur-lg border border-[#39FF14]/20 rounded-3xl p-8 shadow-xl"
      >
        {/* Header */}
        <h1 className="text-3xl font-black text-white mb-6 text-center">
          Match Details
        </h1>

        {/* Match ID */}
        <div className="flex justify-between items-center mb-4 text-gray-400">
          <span className="font-medium">Match ID:</span>
          <span className="text-[#39FF14] font-mono">{id}</span>
        </div>

        {/* Sport & Venue */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <Users className="text-[#39FF14]" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Sport</p>
              <p className="text-white font-medium text-lg">{sport}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="text-[#39FF14]" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Venue</p>
              <p className="text-white font-medium text-lg">{venue}</p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex space-x-8 mb-6 text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="text-[#39FF14]" size={20} />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="text-[#39FF14]" size={20} />
            <span>{time}</span>
          </div>
        </div>

        {/* Players Joined */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Players Joined ({players.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {players.map((player, idx) => (
              <div
                key={idx}
                className="bg-[#0a0f1c] border border-[#39FF14]/20 rounded-xl p-4 text-center"
              >
                <Users className="mx-auto text-[#39FF14]" size={28} />
                <p className="mt-2 text-gray-300 text-sm">{player}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          className="w-full flex items-center justify-center gap-2 bg-[#39FF14] text-black font-bold py-3 rounded-xl hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)]"
        >
          Join Match
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
};

export default MatchDetails;
