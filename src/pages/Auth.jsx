import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // ── Login Handler ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      login(data);

      const role = data.role || data.user?.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Register Handler ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regEmail.trim() || !regPhone || !regPassword || !regConfirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (regPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone,
          password: regPassword,
          confirmPassword: regConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      login(data);
      navigate('/');
    } catch (err) {
      console.error('Register Error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  // ── Render ──
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
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/40 rounded-2xl p-1 mb-6 border border-white/5">
          {['login', 'register'].map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
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

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ── LOGIN TAB ── */}
          {activeTab === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {/* Email */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-gray-400 hover:text-[#39FF14] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                disabled={loading || !loginEmail.trim() || !loginPassword}
                type="submit"
                className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  'LOGIN'
                )}
              </button>

              {/* Switch to Register */}
              <p className="text-center text-sm text-gray-400 font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="text-[#39FF14] font-bold hover:underline"
                >
                  Register
                </button>
              </p>
            </motion.form>
          )}

          {/* ── REGISTER TAB ── */}
          {activeTab === 'register' && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {/* Full Name */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Phone */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Phone size={20} />
                </div>
                <div className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Mobile Number"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-24 pr-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showRegConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Submit */}
              <button
                disabled={loading || !regName.trim() || !regEmail.trim() || !regPhone || !regPassword || !regConfirmPassword}
                type="submit"
                className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  'CREATE ACCOUNT'
                )}
              </button>

              {/* Switch to Login */}
              <p className="text-center text-sm text-gray-400 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-[#39FF14] font-bold hover:underline"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Admin / Venue Partner Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Admin or Venue Partner?{' '}
            <Link
              to="/partner/login"
              className="text-[#39FF14] font-bold hover:underline"
            >
              Staff Login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <Lock size={12} className="mr-1.5 text-gray-700" />
          Secured by PlayNow
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
