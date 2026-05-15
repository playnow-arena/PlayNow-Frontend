import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Lock, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const OwnerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerId: '',
    password: '',
    name: '',
    venueName: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Safety check for Owner ID format
    const ownerIdRegex = /^OWN-\d+$/;
    if (isLogin && !ownerIdRegex.test(formData.ownerId)) {
      setError('Invalid Owner ID format. Must be OWN- followed by numbers (e.g., OWN-1234).');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Real Backend Fetch
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerId: formData.ownerId,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          login(data); // Store owner details in context
          navigate('/owner');
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
      } else {
        // Register logic (if needed, or redirect to register page)
        alert('Registration request sent to admin. Please wait for approval and your Owner ID.');
        setIsLogin(true);
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      console.error('Login error:', err);
      
      // Fallback for demo purposes if backend is down
      if (formData.ownerId === 'OWN-1234' && formData.password === 'password') {
        login({ name: 'Demo Owner', role: 'owner', venueName: 'Elite Arena', id: 'OWN-1234' });
        navigate('/owner');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-[#0a0f1c]">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#151b2b] border border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(57,255,20,0.15)]">
            <Building2 className="text-[#39FF14]" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Partner Portal</h1>
          <p className="text-gray-400">
            {isLogin ? 'Login to manage your sports venue' : 'Register your venue on PlayNow'}
          </p>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151b2b] border border-gray-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex bg-[#0a0f1c] p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${isLogin ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${!isLogin ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition" size={18} />
                    <input 
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#39FF14] transition"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Venue Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition" size={18} />
                    <input 
                      type="text"
                      required
                      placeholder="Smash Arena"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#39FF14] transition"
                      onChange={(e) => setFormData({...formData, venueName: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Owner ID</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition" size={18} />
                <input 
                  type="text"
                  required
                  placeholder="OWN-1234"
                  value={formData.ownerId}
                  className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#39FF14] transition"
                  onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39FF14] transition" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#39FF14] transition"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#39FF14] text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#32E612] transition shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Login as Owner' : 'Register as Partner')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-center text-sm text-gray-500">
              Are you a player? <Link to="/login" className="text-[#39FF14] font-bold hover:underline">Player Login</Link>
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-gray-600">
          By joining the Partner Portal, you agree to PlayNow's Venue Terms and Service Policies.
        </p>
      </div>
    </div>
  );
};

export default OwnerAuth;
