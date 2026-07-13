import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Custom SVG for Instagram to avoid Lucide dependency issues
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Custom SVG for YouTube to avoid Lucide dependency issues
const YoutubeIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full bg-[#0a0f1c]/90 backdrop-blur-md border-t border-white/5 pt-12 pb-16 md:pb-8 mt-auto relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          {/* Brand & Socials */}
          <div className="flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
            <div>
              <h2 className="brand-font text-3xl font-black tracking-tighter text-white">
                Play<span className="text-[#39FF14]">Now</span>
              </h2>
              <p className="text-sm text-gray-400 font-medium mt-2 max-w-xs">
                Book Courts. Host Matches. Play More.
              </p>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/playnowarena.in?igsh=MXJ5N3p5YmM0aTByOA==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#39FF14] transition-colors transform hover:scale-110" 
                aria-label="Instagram"
              >
                <InstagramIcon size={24} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#39FF14] transition-colors transform hover:scale-110" 
                aria-label="YouTube"
              >
                <YoutubeIcon size={24} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-6 text-sm font-semibold text-gray-300 text-center">
            <Link to="/terms" className="hover:text-[#39FF14] transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-[#39FF14] transition-colors">Contact</Link>
            <Link to="/partner/register" className="hover:text-[#39FF14] transition-colors max-w-full break-words">Partner with PlayNow</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} PlayNow. All Rights Reserved.
        </div>
      </div>
    </motion.footer>
  );
};

export default React.memo(Footer);
