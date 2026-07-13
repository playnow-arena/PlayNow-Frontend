import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, CreditCard, Wallet, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadRazorpayCheckout } from '../utils/razorpay';

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

const formatSlotDate = (slot) => {
  if (!slot?.date) return 'Date unavailable';

  return new Date(slot.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatVenueLocation = (venue) => (
  [venue?.area, venue?.city, venue?.landmark].filter(Boolean).join(' • ') || venue?.location || ''
);

const getVenueSupportPhone = (venue) => (
  venue?.contacts?.incharge?.phone ||
  venue?.contacts?.incharge?.whatsapp ||
  venue?.contacts?.operational?.phone ||
  venue?.contacts?.operational?.whatsapp ||
  venue?.contacts?.owner?.phone ||
  ''
);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('playnow_user') || 'null');
  } catch {
    return null;
  }
};

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSlots = [], venue = null, selectedSport = '' } = location.state || {};
  
  const [paymentType, setPaymentType] = useState('full'); // full or advance
  const [paymentStep, setPaymentStep] = useState(1); // 1: summary, 2: processing, 3: success
  const [bookingDetails, setBookingDetails] = useState(null);
  const bookingConfirmedRef = useRef(false);

  const slotTotal = selectedSlots.reduce((sum, slot) => sum + Number(slot.price || venue?.pricePerHour || 400), 0);
  const totalAmount = slotTotal || (venue?.pricePerHour || 400) * selectedSlots.length;
  const advanceAmount = 100 * selectedSlots.length; 
  const amountToPay = paymentType === 'full' ? totalAmount : advanceAmount;
  const storedUser = getStoredUser();

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
        if (!bookingConfirmedRef.current) {
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
  }, [selectedSlots, venue, navigate]);

  const handlePayment = async () => {
    setPaymentStep(2);
    
    try {
      const token = localStorage.getItem('playnow_token');
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: venue._id || venue.id,
          slotIds: selectedSlots.map(s => s._id),
          selectedSport,
          paymentType
        })
      });

      const order = await orderRes.json();
      if (!orderRes.ok) {
        alert(order.message || 'Unable to start payment');
        setPaymentStep(1);
        return;
      }

      await loadRazorpayCheckout();

      const razorpay = new window.Razorpay({
        key: order.key_id || order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id || order.orderId,
        name: 'PlayNow',
        description: `${paymentType === 'advance' ? 'Advance' : 'Full'} payment for ${venue.name}`,
        prefill: {
          name: storedUser?.name || '',
          email: storedUser?.email || '',
          contact: storedUser?.phone || ''
        },
        theme: {
          color: '#39FF14'
        },
        modal: {
          ondismiss: () => setPaymentStep(1)
        },
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });
            const paymentResult = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(paymentResult.message || 'Payment verification failed');
            }

            bookingConfirmedRef.current = true;
            setBookingDetails(paymentResult.booking || paymentResult);
            setPaymentStep(3);
          } catch (verificationError) {
            console.error('Payment verification failed:', verificationError);
            alert(verificationError.message || 'Payment verification failed');
            setPaymentStep(1);
          }
        }
      });

      razorpay.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response.error);
        alert(response.error?.description || 'Payment failed. No booking was created.');
        setPaymentStep(1);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert(error.message || 'Unable to process payment');
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
    const bookingId = bookingDetails?.bookingCode || bookingDetails?._id || 'ERROR';
    const paidOnline = bookingDetails?.paidAmount ?? amountToPay;
    const finalTotal = bookingDetails?.totalAmount ?? totalAmount;
    const balanceDue = bookingDetails?.remainingAmount ?? Math.max(finalTotal - paidOnline, 0);
    const paymentStatus = bookingDetails?.paymentStatus || (balanceDue > 0 ? 'advance_paid' : 'completed');
    const bookingStatus = bookingDetails?.bookingStatus || 'confirmed';
    const venueAddress = [venue.address, formatVenueLocation(venue)].filter(Boolean).join(' • ') || 'Address unavailable';
    const venueSupportPhone = getVenueSupportPhone(venue);
    const playerName = bookingDetails?.userId?.name || storedUser?.name || storedUser?.username || '';
    const playerPhone = bookingDetails?.userId?.phone || storedUser?.phone || '';

    return (
      <div className="min-h-screen pt-20 pb-28 px-4 flex flex-col items-center justify-center overflow-x-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#151b2b] p-5 sm:p-6 md:p-8 rounded-3xl border border-[#39FF14]/50 max-w-2xl w-full text-left relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#39FF14]"></div>
          <div className="text-center border-b border-dashed border-gray-700 pb-6 mb-6">
            <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-[#39FF14]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400">Show this booking at the venue. Pay remaining balance before play.</p>
          </div>

          <div className="bg-[#0a0f1c] rounded-2xl p-4 mb-5 text-left border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mb-2">
              <span className="text-gray-400">Booking ID</span>
              <span className="font-bold text-[#39FF14]">#{bookingId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mb-2">
              <span className="text-gray-400">Payment Status</span>
              <span className="font-bold uppercase">{paymentStatus.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-400">Booking Status</span>
              <span className="font-bold uppercase">{bookingStatus}</span>
            </div>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Venue</p>
              <h3 className="text-xl sm:text-2xl font-black text-white break-words">{venue.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{venueAddress}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-gray-800">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Date</p>
                <p className="font-bold text-white">{formatSlotDate(selectedSlots[0])}</p>
              </div>
              <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-gray-800">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Number of Slots</p>
                <p className="font-bold text-white">{selectedSlots.length}</p>
              </div>
            </div>

            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-gray-800">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Slot Time</p>
              <p className="font-bold text-white leading-relaxed">{selectedSlots.map(formatSlotRange).join(', ')}</p>
              {selectedSport && <p className="text-sm text-gray-400 mt-2">Sport: {selectedSport}</p>}
              <p className="text-sm text-gray-400 mt-1">
                {selectedSlots.map((slot) => `${slot.courtName || 'Court'}${slot.courtNumber ? ` #${slot.courtNumber}` : ''}`).join(', ')}
              </p>
            </div>

            {venueSupportPhone && (
              <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-gray-800">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Venue Contact</p>
                <p className="font-bold text-white">{venueSupportPhone}</p>
              </div>
            )}

            {(playerName || playerPhone) && (
              <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-gray-800">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Player</p>
                <p className="font-bold text-white">{playerName || 'Player'}</p>
                {playerPhone && <p className="text-sm text-gray-400 mt-1">{playerPhone}</p>}
              </div>
            )}

            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-gray-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-black text-white">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                <span className="text-gray-400">Paid Online</span>
                <span className="font-black text-[#39FF14]">{formatCurrency(paidOnline)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-t border-gray-800 pt-3">
                <span className="text-gray-400">Balance to Pay at Venue</span>
                <span className={`font-black ${balanceDue > 0 ? 'text-yellow-400' : 'text-[#39FF14]'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#39FF14]/30 bg-[#39FF14]/10 p-4 text-sm text-gray-200 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
              <span>Show this booking at the venue. Pay remaining balance before play.</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0f1c] p-4 text-sm text-gray-300 space-y-2">
              <p><span className="font-bold text-white">Need help?</span> Contact PlayNow support at +91 93637 56533 or playnowsupport@gmail.com.</p>
              <p>Cancellation allowed up to 4 hours before slot time.</p>
            </div>
          </div>

          <button onClick={handleBackToHome} className="w-full bg-[#39FF14] text-black font-bold py-4 rounded-xl hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return <div className="pt-20 md:pt-24 pb-32 px-4 max-w-3xl mx-auto min-h-screen w-full overflow-x-hidden">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-white mb-6 transition group">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-xs font-black uppercase tracking-widest">Back to Slots</span>
      </button>

      <h1 className="text-2xl font-black uppercase tracking-wider sm:tracking-widest mb-6">Checkout</h1>

      <div className="bg-[#151b2b] rounded-[1.5rem] border border-white/5 p-5 mb-5 shadow-lg">
        <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center">
           <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full mr-2" /> Booking Summary
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-bold uppercase">Arena</span>
            <span className="font-bold text-white uppercase">{venue.name}</span>
          </div>
          <div className="flex justify-between items-start gap-4 border-t border-white/5 pt-3">
            <span className="text-gray-500 font-bold uppercase">Slots</span>
            <div className="font-bold text-[#39FF14] text-right">
              {selectedSlots.map(formatSlotRange).join(', ')}
              <span className="block text-[10px] text-gray-500 mt-1 uppercase">{selectedSlots.map((slot) => `${slot.courtName || 'Court'}`).join(', ')}</span>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-3 font-black text-lg">
            <span>Total</span>
            <span className="text-[#39FF14]">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#151b2b] rounded-[1.5rem] border border-white/5 p-5 mb-8 shadow-lg">
        <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
           <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full mr-2" /> Select Payment
        </h2>
        
        <div className="space-y-3">
          <label className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${paymentType === 'full' ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-white/5 bg-black/30'}`}>
            <input type="radio" name="paymentType" value="full" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} className="hidden" />
            <div className="flex-1">
              <div className="font-black text-xs uppercase tracking-wider text-white">Pay in Full</div>
            </div>
            <div className="font-black text-sm text-[#39FF14]">₹{totalAmount}</div>
          </label>

          <label className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${paymentType === 'advance' ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-white/5 bg-black/30'}`}>
            <input type="radio" name="paymentType" value="advance" checked={paymentType === 'advance'} onChange={() => setPaymentType('advance')} className="hidden" />
            <div className="flex-1">
              <div className="font-black text-xs uppercase tracking-wider text-white">Pay Advance</div>
              <div className="text-[9px] text-gray-500 font-bold mt-0.5">₹100/slot to lock</div>
            </div>
            <div className="font-black text-sm text-[#39FF14]">₹{advanceAmount}</div>
          </label>
        </div>
      </div>

      {/* Mobile Sticky Pay Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-[#0a0f1c]/95 backdrop-blur-md border-t border-white/10 px-4 py-4 z-40 pb-safe">
         <button onClick={handlePayment} className="w-full bg-[#39FF14] text-black font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-xl flex items-center justify-center btn-touch active:scale-[0.98]">
            <ShieldCheck size={18} className="mr-2" /> Pay ₹{amountToPay} Securely
         </button>
      </div>
    </div>;
};

export default Booking;

