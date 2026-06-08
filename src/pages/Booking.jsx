import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, CreditCard, Wallet, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const formatTime = (time) => {
  if (!time) return '';

  const [hourValue, minute = '00'] = time.split(':');
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

const formatSlotRange = (slot) => {
  if (!slot) return '';

  return [formatTime(slot.startTime), formatTime(slot.endTime)].filter(Boolean).join(' - ');
};

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSlots = [], venue = null } = location.state || {};
  
  const [paymentType, setPaymentType] = useState('full'); // full or advance
  const [paymentStep, setPaymentStep] = useState(1); // 1: summary, 2: processing, 3: success
  const [bookingDetails, setBookingDetails] = useState(null);

  const totalAmount = (venue?.pricePerHour || 400) * selectedSlots.length;
  const advanceAmount = 100 * selectedSlots.length; 
  const amountToPay = paymentType === 'full' ? totalAmount : advanceAmount;

  // Lock slots on mount
  useEffect(() => {
    if (!selectedSlots.length || !venue) {
      navigate('/venues');
      return;
    }

    const lock = async () => {
      try {
        const token = localStorage.getItem('playnow_token');
        await fetch(`${API_BASE_URL}/api/slots/lock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            slotIds: selectedSlots.map(s => s._id),
            venueId: venue._id || venue.id 
          })
        });
      } catch (error) {
        console.error('Locking failed:', error);
      }
    };

    lock();

    // Unlock slots if user leaves
    return () => {
      const unlock = async () => {
        // Only unlock if booking not confirmed
        if (paymentStep !== 3) {
          const token = localStorage.getItem('playnow_token');
          await fetch(`${API_BASE_URL}/api/slots/unlock`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              slotIds: selectedSlots.map(s => s._id),
              venueId: venue._id || venue.id 
            })
          });
        }
      };
      unlock();
    };
  }, [selectedSlots, venue, navigate, paymentStep]);

  const handlePayment = async () => {
    setPaymentStep(2);
    
    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: venue._id || venue.id,
          slotIds: selectedSlots.map(s => s._id),
          paymentType,
          paidAmount: amountToPay
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBookingDetails(data);
        setPaymentStep(3);
      } else {
        alert(data.message || 'Payment failed');
        setPaymentStep(1);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentStep(1);
    }
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  if (!selectedSlots.length || !venue) {
    return (
      <div className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-[#39FF14] rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold">Loading booking...</h2>
        <p className="text-gray-400 mt-2">Taking you back to venues.</p>
      </div>
    );
  }

  if (paymentStep === 2) {
    return (
      <div className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-[#39FF14] rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold">Processing Payment...</h2>
        <p className="text-gray-400 mt-2">Please do not close this window.</p>
      </div>
    );
  }

  if (paymentStep === 3) {
    return (
      <div className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#151b2b] p-8 rounded-3xl border border-[#39FF14]/50 max-w-md w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#39FF14]"></div>
          <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#39FF14]" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-6">Your slots at {venue.name} have been locked.</p>
          
          <div className="bg-[#0a0f1c] rounded-xl p-4 mb-8 text-left border border-gray-800">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Booking ID</span>
              <span className="font-bold">#{(bookingDetails?._id || 'ERROR').slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Slots</span>
              <span className="font-medium text-right">{selectedSlots.map(formatSlotRange).join(', ')}</span>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
              <span className="text-gray-400">Amount Paid</span>
              <span className="font-bold text-[#39FF14]">₹{amountToPay}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-sm text-gray-400 mb-8">
            <ShieldCheck size={16} className="text-[#39FF14] mr-2" />
            Confirmation sent via WhatsApp & Email
          </div>

          <button onClick={handleBackToHome} className="w-full bg-[#39FF14] text-black font-bold py-4 rounded-xl hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return <div className="pt-24 pb-32 px-4 max-w-3xl mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-white mb-6 transition group">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-xs font-black uppercase tracking-widest">Back to Slots</span>
      </button>

      <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest mb-8">Checkout</h1>

      <div className="bg-[#151b2b] rounded-[2rem] border border-white/5 p-6 md:p-10 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
           <CheckCircle2 size={120} />
        </div>
        <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center">
           <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> Booking Summary
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Arena</span>
            <span className="font-black text-white uppercase">{venue.name}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Selected Slots</span>
            <span className="font-black text-[#39FF14] text-right text-sm max-w-[180px] sm:max-w-none">
              {selectedSlots.map(formatSlotRange).join(', ')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Price per slot</span>
            <span className="font-black text-white">₹{venue.pricePerHour}</span>
          </div>
          <div className="flex justify-between items-center font-black text-2xl mt-8 border-t border-white/5 pt-6">
            <span className="uppercase tracking-tighter">Total Amount</span>
            <span className="text-[#39FF14] tracking-tighter">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#151b2b] rounded-[2rem] border border-white/5 p-6 md:p-10 mb-8 shadow-2xl">
        <h2 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center">
           <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> Payment Options
        </h2>
        
        <div className="space-y-4">
          <label className={`flex items-center p-5 rounded-[1.5rem] border transition-all cursor-pointer group ${paymentType === 'full' ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.1)]' : 'border-white/5 bg-black/40 hover:border-white/10'}`}>
            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${paymentType === 'full' ? 'border-[#39FF14]' : 'border-gray-700'}`}>
               {paymentType === 'full' && <div className="w-3 h-3 bg-[#39FF14] rounded-full" />}
            </div>
            <input type="radio" name="paymentType" value="full" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} className="hidden" />
            <div className="flex-1">
              <div className="font-black text-sm uppercase tracking-widest text-white">Pay in Full</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Settle complete balance now</div>
            </div>
            <div className="font-black text-xl text-[#39FF14] tracking-tighter">₹{totalAmount}</div>
          </label>

          <label className={`flex items-center p-5 rounded-[1.5rem] border transition-all cursor-pointer group ${paymentType === 'advance' ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.1)]' : 'border-white/5 bg-black/40 hover:border-white/10'}`}>
            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${paymentType === 'advance' ? 'border-[#39FF14]' : 'border-gray-700'}`}>
               {paymentType === 'advance' && <div className="w-3 h-3 bg-[#39FF14] rounded-full" />}
            </div>
            <input type="radio" name="paymentType" value="advance" checked={paymentType === 'advance'} onChange={() => setPaymentType('advance')} className="hidden" />
            <div className="flex-1">
              <div className="font-black text-sm uppercase tracking-widest text-white">Pay Advance</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">₹100/slot to lock booking</div>
            </div>
            <div className="font-black text-xl text-[#39FF14] tracking-tighter">₹{advanceAmount}</div>
          </label>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#151b2b] rounded-[2rem] border border-white/5 p-6 md:p-10 mb-8 shadow-2xl">
        <h2 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center">
           <span className="w-2 h-2 bg-[#39FF14] rounded-full mr-3" /> Select Method
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] border border-[#39FF14]/30 bg-[#39FF14]/5 text-white transition-all group hover:border-[#39FF14]">
            <Wallet size={28} className="mb-3 text-[#39FF14] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">UPI / QR</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] border border-white/5 bg-black/40 text-gray-500 hover:text-white hover:border-white/20 transition-all group">
            <CreditCard size={28} className="mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Card</span>
          </button>
        </div>
        
        {/* Desktop Button */}
        <button onClick={handlePayment} className="hidden md:flex w-full bg-[#39FF14] text-black font-black py-5 rounded-2xl text-sm uppercase tracking-[0.3em] hover:bg-[#32E612] transition shadow-xl items-center justify-center group btn-touch">
          <ShieldCheck size={20} className="mr-3 group-hover:rotate-12 transition-transform" /> Pay ₹{amountToPay} Securely
        </button>
      </div>

      {/* Mobile Sticky Pay Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-[#0a0f1c]/90 backdrop-blur-lg border-t border-white/10 px-4 py-5 z-40 pb-safe">
         <button onClick={handlePayment} className="w-full bg-[#39FF14] text-black font-black py-4 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center btn-touch">
            <ShieldCheck size={18} className="mr-2" /> Pay ₹{amountToPay} Securely
         </button>
      </div>
    </div>;
};

export default Booking;
