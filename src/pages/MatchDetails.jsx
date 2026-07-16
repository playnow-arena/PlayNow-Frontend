import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Clock, CheckCircle, Copy, ArrowRight } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/matches/${id}`);
        const data = await res.json();
        setMatch(data);
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleJoin = () => {
    // API call to join would go here
    alert('You have joined the match!');
  };

  if (loading) return <div className="min-h-screen pt-24 pb-12 px-4 text-center text-white">Loading...</div>;
  if (!match) return <div className="min-h-screen pt-24 pb-12 px-4 text-center text-white">Match not found.</div>;

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
          <span className="text-[#39FF14] font-mono">{match._id}</span>
        </div>

        {/* Sport & Venue */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <Users className="text-[#39FF14]" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Sport</p>
              <p className="text-white font-medium text-lg">{match.sport}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="text-[#39FF14]" size={24} />
            <div>
              <p className="text-gray-500 text-sm">Venue</p>
              <p className="text-white font-medium text-lg">{match.venue}</p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex space-x-8 mb-6 text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="text-[#39FF14]" size={20} />
            <span>{new Date(match.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="text-[#39FF14]" size={20} />
            <span>{match.time}</span>
          </div>
        </div>

        {/* Players Joined */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Players Joined ({match.players?.length || 0})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {match.players?.map((player, idx) => (
              <div
                key={idx}
                className="bg-[#0a0f1c] border border-[#39FF14]/20 rounded-xl p-4 text-center"
              >
                <Users className="mx-auto text-[#39FF14]" size={28} />
                <p className="mt-2 text-gray-300 text-sm">{player.name || player}</p>
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
