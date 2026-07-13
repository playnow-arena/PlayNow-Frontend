import React from 'react';

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen w-full">
    <div className="w-10 h-10 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default LoadingFallback;
