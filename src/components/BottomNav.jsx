import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Trophy, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const isOwner = user?.role === 'owner' || (Array.isArray(user?.roles) && user.roles.includes('owner'));

  const isAuthPage = path === '/login';
  const isAdminPage = path === '/super-admin-portal-2026';
  const isBookingPage = path.startsWith('/book/');

  if (isAuthPage || isAdminPage || isBookingPage) return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Venues', path: '/venues', icon: MapPin },
    { name: 'Host', path: '/host-match', icon: Users },
    { name: 'Open', path: '/open-matches', icon: Trophy },
    { name: 'Profile', path: isOwner ? '/owner' : '/dashboard', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 mx-auto max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.1)] pb-safe z-50 px-1 py-1.5">
      <div className="flex justify-around items-center h-12 relative w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path || (path.startsWith('/venues') && item.path === '/venues');

          return (
            <Link
              key={item.name}
              to={item.path}
              aria-label={item.name}
              className="flex flex-col items-center justify-center w-full h-full relative cursor-pointer select-none focus:outline-none rounded-2xl"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute inset-0.5 rounded-[18px] bg-[#39FF14]/10 border border-[#39FF14]/25 shadow-[0_0_12px_rgba(57,255,20,0.1)] -z-10"
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={clsx(
                  "flex flex-col items-center justify-center transition-colors duration-200 w-full h-full",
                  isActive ? "text-[#39FF14]" : "text-white/60 hover:text-white/95"
                )}
              >
                <Icon size={18} className={clsx("mb-0.5", isActive && "drop-shadow-[0_0_4px_rgba(57,255,20,0.3)]")} />
                <span className={clsx(
                  "text-[8px] uppercase tracking-wider font-extrabold",
                  isActive ? "text-[#39FF14]" : "text-white/50"
                )}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BottomNav);
