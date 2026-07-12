import React, { useEffect, useRef, useState } from 'react';
import { BellRing, CheckCircle2, IndianRupee, MapPin, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const playOwnerAlertSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audio = new AudioContext();
  const now = audio.currentTime;
  const notes = [880, 1108, 1320, 1108];

  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.14);
    gain.gain.setValueAtTime(0.0001, now + index * 0.14);
    gain.gain.exponentialRampToValueAtTime(0.14, now + index * 0.14 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 0.12);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now + index * 0.14);
    oscillator.stop(now + index * 0.14 + 0.13);
  });

  setTimeout(() => audio.close(), 1000);
};

const BookingRealtimeAlerts = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const seenEventsRef = useRef(new Set());

  useEffect(() => {
    if (!socket || !user) return undefined;

    const showAlert = (payload, audience) => {
      const eventKey = `${audience}:${payload?.bookingId || payload?._id || Date.now()}`;
      if (seenEventsRef.current.has(eventKey)) return;
      seenEventsRef.current.add(eventKey);

      setAlert({ ...payload, audience });
      if (audience === 'owner') {
        playOwnerAlertSound();
      }

      window.clearTimeout(showAlert.timeoutId);
      showAlert.timeoutId = window.setTimeout(() => setAlert(null), 7000);
    };

    const handlePlayerBooking = (payload) => showAlert(payload, 'player');
    const handleOwnerBooking = (payload) => {
      const isOwner = user.role === 'owner' || user.role === 'admin' || user.roles?.includes('owner');
      if (isOwner) showAlert(payload, 'owner');
    };

    socket.on('booking_confirmed', handlePlayerBooking);
    socket.on('booking_received', handleOwnerBooking);

    return () => {
      socket.off('booking_confirmed', handlePlayerBooking);
      socket.off('booking_received', handleOwnerBooking);
    };
  }, [socket, user]);

  const isOwnerAlert = alert?.audience === 'owner';

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="fixed top-20 right-4 left-4 sm:left-auto sm:w-[380px] z-[80] rounded-3xl border border-[#39FF14]/30 bg-[#111625]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden"
        >
          <div className="h-1.5 bg-[#39FF14]" />
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center shrink-0">
                {isOwnerAlert ? (
                  <BellRing size={22} className="text-[#39FF14]" />
                ) : (
                  <CheckCircle2 size={22} className="text-[#39FF14]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-black text-sm uppercase tracking-wider">
                  {isOwnerAlert ? 'New Booking Received' : 'Booking Confirmed'}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {isOwnerAlert ? 'A customer just booked a slot.' : 'Your booking proof is ready.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAlert(null)}
                className="text-gray-500 hover:text-white text-xl leading-none"
                aria-label="Close booking notification"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-200">
                <MapPin size={15} className="text-[#39FF14] mt-0.5 shrink-0" />
                <span className="font-bold">{alert.venueName || 'Venue'}</span>
              </div>
              {alert.court && <p className="text-gray-400 text-xs">Court: {alert.court}</p>}
              {alert.time && <p className="text-gray-400 text-xs">Time: {alert.date ? `${alert.date} · ` : ''}{alert.time}</p>}
              {isOwnerAlert && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-2xl bg-black/30 border border-white/5 p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-[10px] font-black uppercase">
                      <User size={12} /> Customer
                    </div>
                    <p className="text-white font-bold text-xs mt-1 truncate">{alert.customerName || 'Player'}</p>
                  </div>
                  <div className="rounded-2xl bg-black/30 border border-white/5 p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-[10px] font-black uppercase">
                      <IndianRupee size={12} /> Amount
                    </div>
                    <p className="text-[#39FF14] font-black text-xs mt-1">{formatCurrency(alert.totalAmount)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingRealtimeAlerts;
