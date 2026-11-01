import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const MatchDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [joinError, setJoinError] = useState('');

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

  const handleJoin = async () => {
    setJoining(true);
    setJoinError('');
    setJoinMessage('');
    try {
      const token = localStorage.getItem('playnow_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/matches/${id}/join`, {
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
        setMatch(data.match);
        setJoinMessage('You have joined the match!');
      }
    } catch (err) {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 pb-12 px-4 text-center text-white">Loading...</div>;
  if (!match) return <div className="min-h-screen pt-24 pb-12 px-4 text-center text-white">Match not found.</div>;

  const currentUserId = user?.id || user?._id;
  const joinedPlayers = match.joinedPlayers || [];
  const joinedCount = joinedPlayers.length;
  const totalPlayers = match.totalPlayers || 1;
  const spotsLeft = Math.max(totalPlayers - joinedCount, 0);

  const alreadyJoined = currentUserId
    ? joinedPlayers.some((p) => (p._id || p).toString() === currentUserId.toString())
    : false;

  const isHost = currentUserId
    ? (match.host?._id || match.host)?.toString() === currentUserId.toString()
    : false;

  const canJoin =
    match.status === 'open' &&
    spotsLeft > 0 &&
    !!currentUserId &&
    !alreadyJoined &&
    !isHost;

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

        {/* Players info */}
        <div className="flex gap-6 mb-6 text-sm text-gray-400">
          <span>Players: <span className="text-white font-semibold">{joinedCount}/{totalPlayers}</span></span>
          <span>Needed: <span className="text-white font-semibold">{spotsLeft}</span></span>
        </div>

        {/* Contact number */}
        {match.contactPhone && (
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
            <span>Contact:</span>
            <a href={`tel:${match.contactPhone}`} className="text-[#39FF14] font-semibold hover:underline">
              {match.contactPhone}
            </a>
          </div>
        )}

        {/* Players Joined */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Players Joined ({joinedCount})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {joinedPlayers.map((player, idx) => (
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

        {/* Feedback messages */}
        {joinMessage && (
          <p className="text-center text-[#39FF14] font-bold mb-4">{joinMessage}</p>
        )}
        {joinError && (
          <p className="text-center text-red-400 text-sm mb-4">{joinError}</p>
        )}

        {/* Join Button — shown only when eligible */}
        {canJoin && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full flex items-center justify-center gap-2 bg-[#39FF14] text-black font-bold py-3 rounded-xl hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-60"
          >
            {joining ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {joining ? 'Joining...' : 'Join Match'}
          </button>
        )}

        {alreadyJoined && (
          <div className="w-full text-center text-sm font-bold text-[#39FF14] py-3 border border-[#39FF14]/30 rounded-xl">
            ✓ You've joined this match
          </div>
        )}

        {match.status === 'full' && !alreadyJoined && (
          <div className="w-full text-center text-sm font-bold text-gray-500 py-3 border border-gray-700 rounded-xl">
            Match Full
          </div>
        )}

        {match.status === 'started' && (
          <div className="w-full text-center text-sm font-bold text-orange-400 py-3 border border-orange-400/30 rounded-xl">
            This match has already started
          </div>
        )}

        {!currentUserId && (
          <div className="w-full text-center text-sm text-gray-400 py-3">
            <a href="/login" className="text-[#39FF14] font-bold">Log in</a> to join this match.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MatchDetails;
