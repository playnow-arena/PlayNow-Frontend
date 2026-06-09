import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0f1c]/80 backdrop-blur-lg border-t border-[#39FF14]/20 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          
          {/* Brand & Socials */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-white">
              Play<span className="text-[#39FF14]">Now</span>
            </h2>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-[#39FF14] transition-colors transform hover:scale-110" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#39FF14] transition-colors transform hover:scale-110" aria-label="YouTube">
                <Youtube size={26} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base font-medium text-gray-300">
            <Link to="/about" className="hover:text-[#39FF14] transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-[#39FF14] transition-colors">Contact Us</Link>
            <Link to="/privacy" className="hover:text-[#39FF14] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#39FF14] transition-colors">Terms & Conditions</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-gray-500 font-medium">
          &copy; PlayNow. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
