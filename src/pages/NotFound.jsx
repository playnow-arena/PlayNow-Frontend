import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-green-500 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-6">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back in the game.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#32E612] transition shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
