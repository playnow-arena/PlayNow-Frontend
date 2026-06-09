import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Globe, Briefcase, Handshake } from 'lucide-react';

const ContactUs = () => {
  return (
    <div className="pt-24 pb-20 px-4 md:pt-32 min-h-screen flex justify-center">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Contact Info Left Side */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Get in <span className="text-[#39FF14]">Touch</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Have questions or want to partner with us? We'd love to hear from you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-[#151b2b] p-4 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-[#39FF14]/10 rounded-xl flex items-center justify-center">
                <Mail className="text-[#39FF14]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                <p className="text-white font-bold">playnowarena@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-[#151b2b] p-4 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-[#39FF14]/10 rounded-xl flex items-center justify-center">
                <Phone className="text-[#39FF14]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Phone</p>
                <p className="text-white font-bold">+91 93637 56533</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-[#151b2b] p-4 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-[#39FF14]/10 rounded-xl flex items-center justify-center">
                <Globe className="text-[#39FF14]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Instagram</p>
                <p className="text-white font-bold">@playnowarena</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <Briefcase className="text-gray-400" size={20} />
              <h4 className="font-bold text-white">Business Enquiries</h4>
              <p className="text-sm text-gray-500">business@playnow.in</p>
            </div>
            <div className="space-y-2">
              <Handshake className="text-gray-400" size={20} />
              <h4 className="font-bold text-white">Partnerships</h4>
              <p className="text-sm text-gray-500">partner@playnow.in</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Right Side */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#151b2b] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-5 rounded-full blur-[60px]"></div>
          
          <h3 className="text-2xl font-bold mb-6 text-white relative z-10">Send us a message</h3>
          
          <form className="space-y-5 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! (Demo mode)'); }}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/50 transition-colors"
                placeholder="your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/50 transition-colors"
                placeholder="yours email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
              <textarea 
                rows="4" 
                required
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/50 transition-colors resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#39FF14] text-black font-bold py-4 rounded-xl hover:bg-[#32E612] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default ContactUs;
