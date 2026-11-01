import React, { useState, useEffect } from 'react';
import { Users, MapPin, Calendar, Clock, Share2, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const MatchCard = ({ match, onJoined }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const joinedCount = match.joinedPlayers?.length || 0;
  const totalPlayers = match.totalPlayers || 1;
  const spotsLeft = Math.max(totalPlayers - joinedCount, 0);
  const neededPlayers = spotsLeft; // alias for clarity
  const pricePerPlayer = Math.floor((match.totalAmount || 0) / totalPlayers);

  const currentUserId = user?.id || user?._id;
  const alreadyJoined = currentUserId
    ? match.joinedPlayers?.some(
        (p) => (p._id || p).toString() === currentUserId.toString()
      )
    : false;

  const isHost = currentUserId
    ? (match.host?._id || match.host)?.toString() === currentUserId.toString()
    : false;

  // Show Join button when: match is open, has slots, user is logged in, hasn't joined, and isn't the host
  const canJoin =
    match.status === 'open' &&
    spotsLeft > 0 &&
    !!currentUserId &&
    !alreadyJoined &&
    !isHost;

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

  const handleJoin = async () => {
    if (!currentUserId) return;
    setJoining(true);
    setJoinError('');
    try {
      const token = localStorage.getItem('playnow_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/matches/${match._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.message || 'Failed to join match');
      } else {
        // Notify parent (Feed) so it can update/remove this card
        if (onJoined) onJoined(data.match);
      }
    } catch (err) {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
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
        {neededPlayers > 0 && (
          <div className="text-xs text-gray-400">
            Needed: <span className="text-white font-semibold">{neededPlayers} player{neededPlayers !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button onClick={openMap} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-700 transition">
           <MapPin size={16} /> View Map
        </button>
        <div className="flex -space-x-2">
            {match.joinedPlayers?.slice(0, 3).map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151b2b] flex items-center justify-center text-[10px] font-bold">
                    {(p.name || p)?.charAt(0) || 'P'}
                </div>
            ))}
            {joinedCount > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#151b2b] flex items-center justify-center text-[10px] font-bold">
                    +{joinedCount - 3}
                </div>
            )}
        </div>
      </div>

      {/* Join button — shown only when eligible */}
      {canJoin && (
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full flex items-center justify-center gap-2 bg-[#39FF14] text-black font-bold py-2.5 rounded-xl hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-60"
        >
          {joining ? <Loader2 size={16} className="animate-spin" /> : null}
          {joining ? 'Joining...' : 'Join'}
        </button>
      )}

      {/* Status badges for non-joinable states */}
      {alreadyJoined && (
        <div className="w-full text-center text-xs font-bold text-[#39FF14] py-1">
          ✓ You've joined this match
        </div>
      )}
      {match.status === 'full' && !alreadyJoined && (
        <div className="w-full text-center text-xs font-bold text-gray-500 py-1">
          Match Full
        </div>
      )}
      {match.status === 'started' && (
        <div className="w-full text-center text-xs font-bold text-orange-400 py-1">
          Match Started
        </div>
      )}

      {joinError && (
        <p className="text-xs text-red-400 text-center">{joinError}</p>
      )}

      <div className="text-center text-sm font-bold text-gray-500 py-1">
        Ends in: <span className="text-white">{timeLeft}</span>
      </div>
    </motion.div>
  );
};

export default MatchCard;
