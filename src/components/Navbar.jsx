import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Bell, UserCircle, Search } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';
  const isAdminPage = location.pathname === '/super-admin-portal-2026';

  if (isAuthPage || isAdminPage) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-md border-b border-gray-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group py-1">
                <img 
                  src="/logo.png" 
                  alt="PlayNow" 
                  className="h-9 w-9 object-cover rounded-xl transition-all duration-300 group-hover:brightness-110 border border-white/10" 
                />
                <span className="text-xl font-black tracking-tighter text-white group-hover:text-[#39FF14] transition-colors">
                  Play<span className="text-[#39FF14] group-hover:text-white transition-colors">Now</span>
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/venues" className="text-gray-300 hover:text-[#39FF14] font-medium transition">Venues</Link>
              <Link to="/host-match" className="text-gray-300 hover:text-[#39FF14] font-medium transition">Host Match</Link>
              <Link to="/feed" className="text-gray-300 hover:text-[#39FF14] font-medium transition">Open Matches</Link>
              
              <div className="w-px h-6 bg-gray-700"></div>

              {user ? (
                <div className="flex items-center gap-4">
                  <Bell size={20} className="text-gray-300 hover:text-white cursor-pointer transition" />
                  <Link to={user.role === 'owner' ? '/owner' : '/dashboard'} className="flex items-center gap-2 hover:opacity-80 transition">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                      {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserCircle size={32} className="text-gray-400" />}
                    </div>
                    <span className="text-sm font-semibold text-white">{user.name}</span>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="bg-[#39FF14] text-black px-5 py-2 rounded-full font-bold hover:bg-[#32E612] transition shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header (Minimal) */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-lg border-b border-white/5 md:hidden px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 py-1">
          <img 
            src="/logo.png" 
            alt="PlayNow" 
            className="h-8 w-8 object-cover rounded-lg border border-white/10" 
          />
          <span className="text-lg font-black tracking-tighter text-white">
            Play<span className="text-[#39FF14]">Now</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition p-1">
            <Search size={20} />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
