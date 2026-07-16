import React, { useState, useEffect } from 'react';
import { Users, MapPin, Calendar, Clock, Share2, Copy, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchCard = ({ match }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const joinedCount = match.joinedPlayers?.length || 0;
  const totalPlayers = match.totalPlayers || 1;
  const spotsLeft = Math.max(totalPlayers - joinedCount, 0);
  const pricePerPlayer = Math.floor((match.totalAmount || 0) / totalPlayers);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const matchDate = new Date(`${match.date}T${match.time}`);
      const now = new Date();
      const diff = matchDate - now;

      if (diff <= 0) {
        setTimeLeft('Match started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [match.date, match.time]);

  const copyToClipboard = () => {
    const url = `${window.location.origin}/match/${match._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openMap = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(match.venue)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151b2b] rounded-3xl border border-gray-800 p-5 space-y-4 shadow-lg"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0a0f1c] border border-gray-700 flex items-center justify-center text-xl font-black text-[#39FF14]">
            {match.host?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-bold text-white">{match.host?.name || 'PlayNow Player'}</h3>
            <p className="text-xs text-gray-400">Host • {match.sport}</p>
          </div>
        </div>
        <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition">
          {copied ? <Check size={18} className="text-[#39FF14]" /> : <Share2 size={18} />}
        </button>
      </div>

      <div className="bg-[#0a0f1c] p-4 rounded-2xl border border-gray-800 space-y-3">
        <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg">{match.venue}</h4>
            <span className="text-[#39FF14] font-black">₹{pricePerPlayer}</span>
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Calendar size={14}/> {match.date}</span>
            <span className="flex items-center gap-1"><Clock size={14}/> {match.time}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
            <span className="text-[#39FF14] font-bold">{spotsLeft} spots left</span>
            <span className="flex items-center gap-1">
                <Users size={14} /> {joinedCount}/{totalPlayers}
            </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button onClick={openMap} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-700 transition">
           <MapPin size={16} /> View Map
        </button>
        <div className="flex -space-x-2">
            {match.joinedPlayers.slice(0, 3).map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151b2b] flex items-center justify-center text-[10px] font-bold">
                    {p.name?.charAt(0) || 'P'}
                </div>
            ))}
            {joinedCount > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#151b2b] flex items-center justify-center text-[10px] font-bold">
                    +{joinedCount - 3}
                </div>
            )}
        </div>
      </div>

      <div className="text-center text-sm font-bold text-gray-500 py-1">
        Ends in: <span className="text-white">{timeLeft}</span>
      </div>
    </motion.div>
  );
};

export default MatchCard;
