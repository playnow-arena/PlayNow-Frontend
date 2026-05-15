import React, { useState } from 'react';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle, ArrowRight, XCircle } from 'lucide-react';

const Cancellation = () => {
  const [showHostOptions, setShowHostOptions] = useState(false);

  return (
    <div className="pt-24 pb-24 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#39FF14]/30">
          <ShieldAlert size={32} className="text-[#39FF14]" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Cancellation Policy</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          We want to keep Play Now fair for everyone. Venue owners need time to re-book slots, and players rely on confirmed matches. Here are our transparent cancellation rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Standard Booking Rules */}
        <div className="bg-[#151b2b] p-8 rounded-3xl border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            Standard Bookings
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-green-400">Before 4 Hours</h3>
                <p className="text-gray-400 text-sm mt-1">Free cancellation. 100% refund of your booking amount will be processed to your original payment method within 3-5 business days.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Clock size={20} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-yellow-400">Within 4 Hours</h3>
                <p className="text-gray-400 text-sm mt-1">10% cancellation fee will be deducted. The remaining 90% will be refunded to your account.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-400">No Show</h3>
                <p className="text-gray-400 text-sm mt-1">If you do not show up for your booked slot without cancelling, no refund will be provided.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hosted Matches Rules */}
        <div className="bg-gradient-to-br from-[#151b2b] to-[#0a0f1c] p-8 rounded-3xl border border-[#39FF14]/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#39FF14]/10 rounded-full blur-[40px]"></div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white relative z-10">
            Hosted Matches
          </h2>
          
          <p className="text-gray-400 text-sm mb-6 relative z-10">
            When you host a match, the slot is temporarily locked for you to gather players.
          </p>

          <div className="bg-[#0a0f1c] p-5 rounded-2xl border border-gray-800 mb-6 relative z-10">
            <h3 className="font-bold text-lg text-white mb-2 flex items-center">
              <AlertTriangle size={18} className="text-yellow-500 mr-2" />
              The 4-Hour Rule
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              If enough players DO NOT join your hosted match 4 hours before the game time, you will receive an alert with options.
            </p>
            <button 
              onClick={() => setShowHostOptions(!showHostOptions)}
              className="text-[#39FF14] text-sm font-bold flex items-center hover:underline"
            >
              See host options simulation <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          {/* Interactive Simulation Panel */}
          {showHostOptions && (
            <div className="bg-[#151b2b] p-5 rounded-2xl border border-red-500/50 relative z-10 animate-fade-in shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="font-bold text-red-400 text-sm">URGENT ACTION REQUIRED</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Your match at Smash Arena starts in 4 hours, but only 2/4 players have joined. What would you like to do?
              </p>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl border border-gray-700 hover:border-[#39FF14] bg-[#0a0f1c] transition group">
                  <div className="font-bold text-white group-hover:text-[#39FF14]">Cancel Match</div>
                  <div className="text-xs text-gray-500 mt-1">Pay minimal 2% deduction fee (₹24)</div>
                </button>
                <button className="w-full text-left p-3 rounded-xl border border-gray-700 hover:border-[#39FF14] bg-[#0a0f1c] transition group">
                  <div className="font-bold text-white group-hover:text-[#39FF14]">Keep Booking</div>
                  <div className="text-xs text-gray-500 mt-1">Pay the full remaining amount (₹600) and play anyway</div>
                </button>
                <button className="w-full text-left p-3 rounded-xl border border-gray-700 hover:border-[#39FF14] bg-[#0a0f1c] transition group">
                  <div className="font-bold text-white group-hover:text-[#39FF14]">Continue Waiting</div>
                  <div className="text-xs text-gray-500 mt-1">Wait for players. Standard 10% fee applies if cancelled later.</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cancellation;
