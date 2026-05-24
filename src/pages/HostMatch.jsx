import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Calendar, Clock, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HostMatch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sport: '',
    venue: '',
    date: '',
    time: '',
    totalPlayers: 4,
    totalAmount: 1200,
  });

  const pricePerPlayer = formData.totalPlayers > 0 ? (formData.totalAmount / formData.totalPlayers).toFixed(0) : 0;

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else {
  try {
    const user = JSON.parse(localStorage.getItem('playnow_user'));

    const res = await fetch('https://playnow-backend-khtk.onrender.com/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to host match');
      return;
    }

    console.log('Match created:', data);

    setStep(4);
  } catch (err) {
    console.error(err);
    alert('Server error while hosting match');
  }
}
  };

  if (step === 4) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#151b2b] p-8 rounded-3xl border border-[#39FF14]/50 max-w-md w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#39FF14]"></div>
          <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#39FF14]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Match Hosted Successfully!</h2>
          <p className="text-gray-400 mb-6">Your match is now live on the feed. Players can join and pay their share.</p>
          
          <div className="bg-[#0a0f1c] rounded-xl p-4 mb-8 text-left border border-gray-800">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Share Link</span>
              <span className="text-[#39FF14] underline cursor-pointer">playnow.com/m/8291</span>
            </div>
          </div>
          
          <button onClick={() => navigate('/dashboard')} className="w-full bg-[#39FF14] text-black font-bold py-3 rounded-xl hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 px-4 max-w-2xl mx-auto min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Host a Match</h1>
        <p className="text-gray-400">Split costs, find players, and play more.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#39FF14] text-black' : 'bg-gray-800 text-gray-500'}`}>1</div>
          <div className={`w-12 h-1 rounded-full ${step >= 2 ? 'bg-[#39FF14]' : 'bg-gray-800'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#39FF14] text-black' : 'bg-gray-800 text-gray-500'}`}>2</div>
          <div className={`w-12 h-1 rounded-full ${step >= 3 ? 'bg-[#39FF14]' : 'bg-gray-800'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-[#39FF14] text-black' : 'bg-gray-800 text-gray-500'}`}>3</div>
        </div>
      </div>

      <motion.div 
        key={step}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-[#151b2b] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl"
      >
        <form onSubmit={handleNext}>
          
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold border-b border-gray-800 pb-3 mb-5">Match Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sport</label>
                <select required value={formData.sport} onChange={(e) => setFormData({...formData, sport: e.target.value})} className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] appearance-none">
                  <option value="" disabled>Select Sport</option>
                  <option value="Football Turf">Football Turf</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Cricket Nets">Cricket Nets</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Venue</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="text" placeholder="Search venue..." value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#39FF14]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#39FF14] [color-scheme:dark]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold border-b border-gray-800 pb-3 mb-5">Players & Split Cost</h2>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total Amount for Booking (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="number" min="100" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value)})} className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#39FF14]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total Players Needed (Including You)</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="number" min="2" max="20" value={formData.totalPlayers} onChange={(e) => setFormData({...formData, totalPlayers: Number(e.target.value)})} className="w-full bg-[#0a0f1c] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#39FF14]" />
                </div>
              </div>

              <div className="bg-gradient-energetic p-5 rounded-xl border border-[#39FF14]/30 mt-6 text-center">
                <span className="text-sm text-gray-300">Each player will pay</span>
                <div className="text-4xl font-extrabold text-[#39FF14] my-2">₹{pricePerPlayer}</div>
                <span className="text-xs text-gray-400">Total amount split equally among {formData.totalPlayers} players</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold border-b border-gray-800 pb-3 mb-5">Review & Publish</h2>
              
              <div className="bg-[#0a0f1c] p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sport</span>
                  <span className="font-bold">{formData.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Venue</span>
                  <span className="font-bold">{formData.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="font-bold">{formData.date} at {formData.time}</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between text-[#39FF14]">
                  <span>Cost per player</span>
                  <span className="font-bold">₹{pricePerPlayer} ({formData.totalPlayers} players)</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mt-4">
                <p className="text-xs text-yellow-500 flex items-start">
                  <span className="mr-2 mt-0.5">⚠️</span>
                  Cancellation rules apply. If players don't join 4 hours before the match, you can cancel with 2% fee or pay the full amount to play.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="w-1/3 bg-transparent border border-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
                Back
              </button>
            )}
            <button type="submit" className="flex-1 bg-[#39FF14] text-black font-bold py-3 rounded-xl hover:bg-[#32E612] transition flex justify-center items-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              {step === 3 ? 'Publish Match' : 'Next'} <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HostMatch;
