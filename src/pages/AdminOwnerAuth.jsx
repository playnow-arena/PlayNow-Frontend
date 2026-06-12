import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  Lock,
  RefreshCw,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

// ── AdminOwnerAuth ──────────────────────────────────────────────────────────
// Provides Mobile Number → OTP login flow exclusively for Admin and Owner roles.
// Players must use /login (Email + Password).
// ────────────────────────────────────────────────────────────────────────────
const AdminOwnerAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Steps:
  //   1 → Phone Input
  //   2 → OTP Verification
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [phone, setPhone]         = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null),
  ];

  // Resend countdown
  useEffect(() => {
    let t;
    if (resendTimer > 0) t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Auto-focus first OTP box when step 2 loads
  useEffect(() => {
    if (step === 2) setTimeout(() => otpRefs[0].current?.focus(), 150);
  }, [step]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        return;
      }

      // Development hint (only present outside production)
      if (data.devOtp) {
        console.log(`[DEV] OTP for +91${phone}: ${data.devOtp}`);
      }

      setStep(2);
      setResendTimer(60);
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'OTP verification failed. Please try again.');
        return;
      }

      const role = data.role || data.user?.role;

      // Only allow admin and owner roles through this portal
      if (role === 'player') {
        setError('Players must use the Player Login page. This portal is for Admins and Venue Partners only.');
        return;
      }

      if (!role || (role !== 'admin' && role !== 'owner')) {
        setError('Access denied. This portal is for Admins and Venue Partners only.');
        return;
      }

      // Authenticated successfully
      login(data);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'owner') {
        navigate('/owner');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setOtpValues(['', '', '', '', '', '']);
    handleSendOtp();
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (/[^0-9]/.test(value)) return;
    const next = [...otpValues];
    next[index] = value;
    setOtpValues(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpValues(pasted.split(''));
      otpRefs[5].current?.focus();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 relative overflow-hidden font-outfit">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.07] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#1a2b3c] rounded-full blur-[120px] opacity-[0.10]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[92%] sm:max-w-md bg-[#151b2b]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >

        {/* Logo + Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/logo.png"
              alt="PlayNow Logo"
              className="w-14 h-14 object-cover rounded-2xl border border-[#39FF14]/30 shadow-[0_0_25px_rgba(57,255,20,0.25)]"
            />
            <span className="text-3xl font-black tracking-tighter text-white">
              Play<span className="text-[#39FF14]">Now</span>
            </span>
          </div>

          {/* Staff badge */}
          <div className="flex items-center gap-1.5 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full px-4 py-1.5 mb-4">
            <ShieldCheck size={14} className="text-[#39FF14]" />
            <span className="text-[#39FF14] text-xs font-black uppercase tracking-widest">
              Staff Portal
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight text-center">
            {step === 1 && 'Admin & Partner Login'}
            {step === 2 && 'Verify OTP'}
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium text-center">
            {step === 1 && 'Enter your registered mobile number to continue.'}
            {step === 2 && `OTP sent to +91 ${phone}`}
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs py-3 px-4 rounded-xl mb-6 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 1: Phone Input ─────────────────────────────────────────── */}
        {step === 1 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSendOtp}
            className="space-y-6"
          >
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                <Phone size={20} />
              </div>
              <div className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none">
                +91
              </div>
              <input
                id="admin-phone-input"
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Mobile Number"
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-24 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
              />
            </div>

            <button
              id="admin-send-otp-btn"
              disabled={loading || phone.length !== 10}
              type="submit"
              className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>SEND OTP</span>
                  <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* ── STEP 2: OTP Verification ────────────────────────────────────── */}
        {step === 2 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleVerifyOtp}
            className="space-y-8"
          >
            {/* 6-digit OTP boxes */}
            <div className="flex justify-between gap-1 sm:gap-2" onPaste={handleOtpPaste}>
              {otpValues.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  id={`admin-otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  required
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-black/40 border border-white/10 rounded-xl text-center text-lg sm:text-xl font-black text-[#39FF14] focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all shadow-inner"
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className="text-sm font-bold text-gray-400 hover:text-[#39FF14] disabled:text-gray-600 transition-colors flex items-center justify-center mx-auto"
              >
                {resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  <><RefreshCw size={14} className="mr-2" /> Resend OTP</>
                )}
              </button>
            </div>

            <button
              id="admin-verify-otp-btn"
              disabled={loading || otpValues.join('').length !== 6}
              type="submit"
              className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 shadow-lg hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'VERIFY & LOGIN'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtpValues(['', '', '', '', '', '']); setError(''); }}
              className="w-full text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              ← Change Number
            </button>
          </motion.form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
          <p className="text-center text-xs text-gray-500 font-medium">
            Are you a player?{' '}
            <Link to="/login" className="text-[#39FF14] font-bold hover:underline">
              Player Login
            </Link>
          </p>
          <div className="flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <Lock size={12} className="mr-1.5 text-gray-700" />
            Secured by PlayNow
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOwnerAuth;
