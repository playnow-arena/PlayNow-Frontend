import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => (
  <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 relative overflow-hidden font-outfit">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-full max-w-lg min-h-[500px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.07] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-full max-w-md min-h-[400px] bg-[#1a2b3c] rounded-full blur-[120px] opacity-[0.10]" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[92%] sm:max-w-md bg-[#151b2b]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center"
    >
      <div className="flex flex-col items-center mb-8">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/logo.png"
          alt="PlayNow Logo"
          className="w-14 h-14 object-cover rounded-2xl border border-[#39FF14]/30 shadow-[0_0_25px_rgba(57,255,20,0.25)] mb-4"
        />
        <h2 className="text-2xl font-black text-white tracking-tight">Forgot Password</h2>
      </div>

      <div className="bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] rounded-2xl px-5 py-5 text-sm font-bold leading-relaxed mb-6">
        Password reset is not available yet. Please contact PlayNow support.
      </div>

      <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-left mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-500 font-black mb-2">Support</p>
        <p className="text-sm text-white font-bold break-all">playnowsupport@gmail.com</p>
        <p className="text-sm text-white font-bold mt-1">+91 93637 56533</p>
      </div>

      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-2 w-full bg-[#39FF14] text-black font-black rounded-2xl py-4 hover:bg-[#32E612] transition"
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

export default ForgotPassword;
