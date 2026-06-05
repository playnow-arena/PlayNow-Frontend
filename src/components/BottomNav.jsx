import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Trophy, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage = path === '/login';
  const isAdminPage = path === '/super-admin-portal-2026';
  const isBookingPage = path.startsWith('/book/');

  if (isAuthPage || isAdminPage || isBookingPage) return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Venues', path: '/venues', icon: MapPin },
    { name: 'Host', path: '/host-match', icon: Users },
    { name: 'Open', path: '/feed', icon: Trophy },
    { name: 'Profile', path: user?.role === 'owner' ? '/owner' : '/dashboard', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-full glass-mobile border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-center h-16 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path || (path.startsWith('/venues') && item.path === '/venues');
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full transition-all btn-touch relative",
                isActive ? "text-[#39FF14]" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-[#39FF14] rounded-b-full shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
              )}
              <Icon 
                size={22} 
                className={clsx(
                  "mb-1 transition-transform", 
                  isActive && "scale-110 drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]"
                )} 
              />
              <span className={clsx(
                "text-[10px] uppercase tracking-widest font-black transition-opacity",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
