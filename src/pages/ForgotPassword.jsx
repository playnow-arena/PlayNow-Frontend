import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to send reset link. Please try again.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 relative overflow-hidden font-outfit">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-full max-w-lg min-h-[500px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.07] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-full max-w-md min-h-[400px] bg-[#1a2b3c] rounded-full blur-[120px] opacity-[0.10]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[92%] sm:max-w-md bg-[#151b2b]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
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
          <h2 className="text-2xl font-black text-white tracking-tight text-center">
            {success ? 'Check Your Email' : 'Forgot Password'}
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium text-center">
            {success
              ? 'We\'ve sent a password reset link to your email.'
              : 'Enter your email and we\'ll send you a reset link.'}
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

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="relative inline-block mb-8">
                <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto border-2 border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.3)]">
                  <CheckCircle2 size={40} className="text-[#39FF14]" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#39FF14] rounded-full blur-xl"
                />
              </div>

              <p className="text-gray-400 text-sm mb-2 font-medium">
                Reset link sent to
              </p>
              <p className="text-white font-bold text-lg mb-8">{email}</p>

              <p className="text-gray-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#39FF14] font-bold text-sm hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Submit */}
              <button
                disabled={loading || !email.trim()}
                type="submit"
                className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  'SEND RESET LINK'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-[#39FF14] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <Lock size={12} className="mr-1.5 text-gray-700" />
          Secured by PlayNow
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
