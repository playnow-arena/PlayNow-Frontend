import React, { useEffect, useState } from 'react';

const Feed = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('https://playnow-backend-khtk.onrender.com/api/matches');
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

  const handleJoinMatch = async (matchId) => {
    try {
      const user = JSON.parse(localStorage.getItem('playnow_user'));

      if (!user?.token) {
        alert('Please login to join a match');
        return;
      }

      const res = await fetch(
        `https://playnow-backend-khtk.onrender.com/api/matches/${matchId}/join`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to join match');
        return;
      }

      alert('Joined match successfully');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error joining match');
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 px-4 max-w-3xl mx-auto min-h-screen w-full overflow-x-hidden">
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
          {matches.map((match) => {
            const joinedCount = match.joinedPlayers?.length || 0;
            const totalPlayers = match.totalPlayers || 1;
            const pricePerPlayer = Math.floor((match.totalAmount || 0) / totalPlayers);
            const spotsLeft = Math.max(totalPlayers - joinedCount, 0);
            const isFull = match.status === 'full' || spotsLeft === 0;

            return (
              <div
                key={match._id}
                className="bg-gradient-to-r from-[#151b2b] to-[#1a233a] rounded-2xl border border-[#39FF14]/30 overflow-hidden relative p-4 sm:p-5 min-w-0"
              >
                <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {isFull ? 'Full' : 'Open Match'}
                </div>

                <div className="flex items-center gap-3 mb-4 min-w-0 pr-20">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold shrink-0">
                    {match.host?.name?.charAt(0) || 'P'}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {match.host?.name || 'PlayNow Player'}
                    </h3>

                    <div className="text-xs text-gray-500 break-words">
                      Hosted an Open Match • {match.sport}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0f1c] p-4 rounded-xl border border-gray-800 mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2 min-w-0">
                    <span className="font-bold text-lg break-words">
                      {match.venue}
                    </span>

                    <span className="text-[#39FF14] font-bold shrink-0">
                      ₹{pricePerPlayer}
                    </span>
                  </div>

                  <div className="text-sm text-gray-400">
                    {match.date} at {match.time}
                  </div>

                  <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded">
                      {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                    </span>
                    <span className="text-xs text-gray-500">
                      {joinedCount}/{totalPlayers} joined
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinMatch(match._id)}
                  disabled={isFull}
                  className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed font-bold py-2 rounded-xl transition"
                >
                  {isFull ? 'Match Full' : 'Join Match'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;
