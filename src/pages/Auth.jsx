import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  CheckCircle2,
  Phone,
  Lock,
  RefreshCw,
  Loader2,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Auth Steps:
  //   1 → Phone Input
  //   2 → OTP Verification
  //   3 → Profile Setup (new users)
  //   4 → Success
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Form state
  const [phone, setPhone]         = useState('');
  const [name, setName]           = useState('');
  const [avatar, setAvatar]       = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  // Firebase state
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [userData, setUserData] = useState(null);
  const recaptchaVerifierRef = useRef(null);

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

  // Auto-focus first OTP box
  useEffect(() => {
    if (step === 2) setTimeout(() => otpRefs[0].current?.focus(), 150);
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // ── Setup invisible reCAPTCHA ──────────────────────────────────────────────
  const setupRecaptcha = () => {
    try {
      // 1. If it already exists, don't recreate it
      if (recaptchaVerifierRef.current) {
        return recaptchaVerifierRef.current;
      }
      
      // 2. Ensure container is clear
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';

      console.log("Initializing new Recaptcha...");
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log("Recaptcha check passed");
        },
        'expired-callback': () => {
          console.warn("Recaptcha expired");
          setError('reCAPTCHA expired. Please try again.');
          clearRecaptcha();
        },
      });

      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.error("Recaptcha initialization failed:", err);
      setError("Security check failed to load. Please refresh the page.");
      return null;
    }
  };

  const clearRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';
    } catch (e) {
      console.warn("Error during recaptcha cleanup:", e);
      recaptchaVerifierRef.current = null;
    }
  };

// ── Step 1: Send OTP via Backend Mock OTP ─────────────────────────────────
const handleSendOtp = async (e) => {
  e?.preventDefault();
  setError('');

  if (phone.length !== 10) {
    setError('Please enter a valid 10-digit mobile number');
    return;
  }

  setLoading(true);

  try {
    const res = await fetch('https://playnow-backend-khtk.onrender.com/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Failed to send OTP');
      return;
    }

    console.log('DEV OTP:', data.devOtp);
    setStep(2);
    setResendTimer(60);
  } catch (err) {
    console.error('Send OTP Error:', err);
    setError('Backend not connected. Please check server.');
  } finally {
    setLoading(false);
  }
};

// ── Step 2: Verify OTP via Backend ─────────────────────────────────────────
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
    const res = await ffetch('https://playnow-backend-khtk.onrender.com/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'OTP verification failed');
      return;
    }

    setUserData(data);
    setStep(data.isNewUser ? 3 : 4);
  } catch (err) {
    console.error('Verify OTP Error:', err);
    setError('Backend not connected. Please check server.');
  } finally {
    setLoading(false);
  }
};

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setOtpValues(['', '', '', '', '', '']);
    clearRecaptcha();
    handleSendOtp();
  };

  // ── OTP input helpers ──────────────────────────────────────────────────────
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

  // ── Step 3: Profile Setup ──────────────────────────────────────────────────
  const handleSetupProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    // In a full app, call PATCH /api/auth/me to persist the name
    // For MVP, update local state only
    setUserData(prev => ({ ...prev, name: name.trim() }));
    setStep(4);
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Step 4: Complete — save to context and navigate ───────────────────────
  const handleComplete = () => {
    login(userData);
    navigate('/');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 relative overflow-hidden font-outfit">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.07] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#1a2b3c] rounded-full blur-[120px] opacity-[0.10]" />
      </div>

      {/* Invisible reCAPTCHA mount point — DO NOT remove */}
      <div id="recaptcha-container" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[92%] sm:max-w-md bg-[#151b2b]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >

        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 mx-auto bg-black rounded-2xl flex items-center justify-center border-2 border-[#39FF14] mb-6 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            <span className="text-[#39FF14] font-black italic text-2xl tracking-tighter">PN</span>
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {step === 1 && 'Get Started'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Setup Profile'}
            {step === 4 && 'All Set!'}
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            {step === 1 && 'Experience sports like never before.'}
            {step === 2 && `Code sent to +91 ${phone} via SMS`}
            {step === 3 && 'How should we call you?'}
            {step === 4 && 'Welcome to the elite club.'}
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

        {/* ── STEP 1: Phone Input ──────────────────────────────────────────── */}
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
                id="phone-input"
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
              id="send-otp-btn"
              disabled={loading || phone.length !== 10}
              type="submit"
              className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>CONTINUE</span>
                  <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">
              By continuing, you agree to our{' '}
              <span className="text-white">Terms</span> &amp;{' '}
              <span className="text-white">Privacy</span>
            </p>
          </motion.form>
        )}

        {/* ── STEP 2: OTP Verification ─────────────────────────────────────── */}
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
                  id={`otp-digit-${i}`}
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
                  <><RefreshCw size={14} className="mr-2" /> Resend Code</>
                )}
              </button>
            </div>

            <button
              id="verify-otp-btn"
              disabled={loading || otpValues.join('').length !== 6}
              type="submit"
              className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 shadow-lg hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'VERIFY & PROCEED'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtpValues(['', '', '', '', '', '']); clearRecaptcha(); }}
              className="w-full text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              ← Change Number
            </button>
          </motion.form>
        )}

        {/* ── STEP 3: Profile Setup ────────────────────────────────────────── */}
        {step === 3 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSetupProfile}
            className="space-y-8"
          >
            <div className="flex flex-col items-center">
              <div className="relative group">
                <label className="w-28 h-28 rounded-full bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-[#39FF14] transition-all overflow-hidden shadow-2xl">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-gray-600 group-hover:text-[#39FF14] transition-colors" />
                  )}
                </label>
                <div className="absolute bottom-1 right-1 bg-[#39FF14] text-black p-1.5 rounded-full shadow-lg">
                  <Upload size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                What should we call you?
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] transition-all"
              />
            </div>

            <button
              disabled={loading || !name.trim()}
              type="submit"
              className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 shadow-lg hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'CREATE ACCOUNT'}
            </button>
          </motion.form>
        )}

        {/* ── STEP 4: Success ──────────────────────────────────────────────── */}
        {step === 4 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <div className="relative inline-block mb-10">
              <div className="w-24 h-24 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto border-2 border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.3)]">
                <CheckCircle2 size={48} className="text-[#39FF14]" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[#39FF14] rounded-full blur-xl"
              />
            </div>

            <h3 className="text-3xl font-black mb-3 text-white">
              Welcome, {userData?.name?.split(' ')[0]}!
            </h3>
            <p className="text-gray-400 mb-8 font-medium">Your squad is waiting for you.</p>

            <div className="bg-black/40 border border-white/5 rounded-[1.5rem] py-6 px-8 mb-10">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Player ID</p>
              <span className="text-2xl font-black text-[#39FF14] tracking-[0.3em] font-mono">
                {userData?.playNowId || 'PN-XXXX'}
              </span>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-white text-black font-black rounded-2xl py-5 shadow-xl hover:bg-[#39FF14] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all transform hover:-translate-y-1 active:scale-95"
            >
              ENTER ARENA
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <Lock size={12} className="mr-1.5 text-gray-700" />
          Secured by PlayNow
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
