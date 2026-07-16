import React, { useEffect, useState } from 'react';
import { normalizeSportName } from '../utils/sports';
import MatchCard from '../components/MatchCard';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const Feed = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/matches`);
        const data = await res.json();

        setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="pt-20 md:pt-24 pb-24 px-4 max-w-xl mx-auto min-h-screen w-full overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
          Open Matches
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Join available matches hosted by PlayNow players.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
          Loading Open Matches...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-[#151b2b] rounded-2xl border border-gray-800 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Open Matches</h2>
          <p className="text-gray-400 text-sm">
            There are no matches looking for players right now.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
