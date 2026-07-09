import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const SUCCESS_MESSAGE = 'If an account exists, a password reset link has been sent.';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!res.ok) {
        await res.json().catch(() => ({}));
      }

      setMessage(SUCCESS_MESSAGE);
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage(SUCCESS_MESSAGE);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 relative overflow-hidden font-outfit">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-full max-w-lg min-h-[500px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.07] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-full max-w-md min-h-[400px] bg-[#1a2b3c] rounded-full blur-[120px] opacity-[0.10]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[92%] sm:max-w-md bg-[#151b2b]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/logo.png"
            alt="PlayNow Logo"
            className="w-14 h-14 object-cover rounded-2xl border border-[#39FF14]/30 shadow-[0_0_25px_rgba(57,255,20,0.25)] mb-4"
          />
          <h2 className="text-2xl font-black text-white tracking-tight">Forgot Password</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your registered email to receive a secure reset link.</p>
        </div>

        {message && (
          <div className="bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] rounded-2xl px-5 py-4 text-sm font-bold leading-relaxed mb-6 flex gap-3">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl px-5 py-4 text-sm font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors" size={20} />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Registered email"
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'SEND RESET LINK'}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center gap-2 w-full text-gray-400 font-bold text-sm hover:text-[#39FF14] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <Lock size={12} className="mr-1.5 text-gray-700" />
          Secured by PlayNow
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
