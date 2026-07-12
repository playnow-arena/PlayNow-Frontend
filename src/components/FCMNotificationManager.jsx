import { useEffect, useState } from 'react';
import {
  getPermissionState,
  refreshFcmToken,
  subscribeToForegroundMessages,
} from '../services/firebaseMessaging';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

const FCMNotificationManager = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || getPermissionState() !== 'granted') return undefined;

    let unsubscribe = () => {};
    let isMounted = true;

    refreshFcmToken().catch((error) => {
      console.error('[FCM] Unable to refresh token:', error);
    });

    subscribeToForegroundMessages((payload) => {
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('playnow:fcm-message', { detail: payload }));
      
      // Show local toast
      const title = payload.notification?.title || payload.data?.title || 'Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      
      setToast({ title, body, id: Date.now() });
      setTimeout(() => setToast(null), 6000);
    }).then((cleanup) => {
      if (isMounted) {
        unsubscribe = cleanup;
      } else {
        cleanup();
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && getPermissionState() === 'granted') {
        refreshFcmToken().catch((error) => {
          console.error('[FCM] Unable to refresh token after visibility change:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed top-20 right-4 z-[9999] w-72 bg-[#151b2b] border border-[#39FF14]/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div className="flex gap-3">
            <div className="p-2 bg-[#39FF14]/10 rounded-xl h-fit">
              <Bell size={18} className="text-[#39FF14]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">{toast.title}</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1 line-clamp-2">{toast.body}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-gray-500 hover:text-white transition h-fit"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FCMNotificationManager;
