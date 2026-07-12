import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const GENERIC_LOGIN_ERROR = 'Invalid email or password.';

const AdminOwnerAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!loginId.trim() || !password) {
      setError(GENERIC_LOGIN_ERROR);
      return;
    }

    setLoading(true);

    try {
      const fcmToken = localStorage.getItem('playnow_fcm_token');
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: loginId.trim(),
          password,
          fcmToken: fcmToken || undefined
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(GENERIC_LOGIN_ERROR);
        return;
      }

      const role = data.role || data.user?.role;

      if (role === 'player') {
        setError('Access denied. Players must use the Player Login page.');
        return;
      }

      if (!role || (role !== 'admin' && role !== 'owner')) {
        setError('Access denied.');
        return;
      }

      login(data);

      if (role === 'admin') {
        navigate('/super-admin-portal-2026');
      } else {
        navigate('/owner');
      }
    } catch (err) {
      console.error('Partner/Admin login error:', err);
      setError('Unable to connect to server. Please try again.');
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
        <div className="flex flex-col items-center mb-10 text-center">
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

          <div className="flex items-center gap-1.5 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full px-4 py-1.5 mb-4">
            <ShieldCheck size={14} className="text-[#39FF14]" />
            <span className="text-[#39FF14] text-xs font-black uppercase tracking-widest">
              Partner / Admin Portal
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Venue Partner / Admin Login
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            Login using your registered email or phone number and password.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs py-3 px-4 rounded-xl mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
              <Mail size={20} />
            </div>
            <input
              id="partner-admin-login-id"
              type="text"
              required
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="Email or Phone Number"
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
              <Lock size={20} />
            </div>
            <input
              id="partner-admin-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-[#39FF14] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            id="partner-admin-login-btn"
            disabled={loading || !loginId.trim() || !password}
            type="submit"
            className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'LOGIN'}
          </button>
        </motion.form>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
          <p className="text-center text-xs text-gray-500 font-medium">
            Players should use the normal PlayNow login page.
          </p>
          <Link
            to="/login"
            className="block text-center text-xs font-bold text-[#39FF14] hover:underline"
          >
            Go to Player Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOwnerAuth;
