import React, { useState } from 'react';
import { Building2, User, Mail, Phone, MapPin, Camera, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const PartnerRegister = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    ownerName: '',
    venueName: '',
    phone: '',
    email: '',
    address: '',
    courts: 1,
    proof: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/owner-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: formData.ownerName,
          phone: formData.phone,
          email: formData.email,
          venueName: formData.venueName,
          address: formData.address,
          numberOfCourts: formData.courts,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || 'Unable to submit request. Please try again.');
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Owner request submit failed:', error);
      setSubmitError('Unable to submit request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-[#0a0f1c]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#151b2b] border border-gray-800 rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-[#39FF14]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-[#39FF14]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4">Request Submitted!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Thank you for registering <span className="text-white font-bold">{formData.venueName}</span>. Our admin team will review your application and documents.
          </p>
          <div className="bg-[#0a0f1c] p-4 rounded-xl border border-gray-800 text-left mb-8">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] mt-1.5"></div> Admin verifies your venue details</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] mt-1.5"></div> Credential generation (Owner ID)</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] mt-1.5"></div> Notification via Email/WhatsApp</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#151b2b] border border-gray-700 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0a0f1c]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase"
          >
            Partner with <span className="text-[#39FF14]">PlayNow</span>
          </motion.h1>
          <p className="text-gray-500 text-sm md:text-lg font-medium uppercase tracking-widest">Join the elite network of 500+ venues</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
          {/* Section 1: Owner Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151b2b] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
               <User size={120} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-[#39FF14] rounded-full" /> Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  type="text" required placeholder="Owner's Name"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all placeholder:text-gray-700"
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  type="email" required placeholder="owner@example.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all placeholder:text-gray-700"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</div>
                   <input 
                     type="tel" required placeholder="98765 43210"
                     className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all placeholder:text-gray-700"
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Venue Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151b2b] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
               <Building2 size={120} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-[#39FF14] rounded-full" /> Venue Details
            </h3>
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Venue Name</label>
                <input 
                  type="text" required placeholder="e.g. Smash Badminton Arena"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all placeholder:text-gray-700"
                  onChange={(e) => setFormData({...formData, venueName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Complete Address</label>
                <textarea 
                  required placeholder="Enter the full address including city and pincode"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all h-28 resize-none placeholder:text-gray-700"
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Courts/Turfs</label>
                  <input 
                    type="number" required min="1"
                    placeholder="1"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all placeholder:text-gray-700"
                    onChange={(e) => setFormData({...formData, courts: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Venue Photos</label>
                  <div className="border-2 border-dashed border-white/5 rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-600 cursor-pointer hover:border-[#39FF14]/50 hover:text-[#39FF14] transition-all bg-black/20 group">
                    <Camera size={20} className="group-hover:scale-110 transition-transform" /> 
                    <span className="text-xs font-black uppercase tracking-widest">Upload Files</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-2xl px-5 py-4 text-sm font-bold">
              {submitError}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#39FF14] text-black font-black py-5 md:py-6 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-[#32E612] transition-all shadow-xl uppercase tracking-[0.3em] text-sm btn-touch disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'} {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="mt-10 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">
          Already a partner? <Link to="/partner/login" className="text-[#39FF14] hover:underline">Login to Portal</Link>
        </p>
      </div>
    </div>
  );
};

export default PartnerRegister;
