import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PROMPT_STORAGE_KEY = 'playnow_install_prompt_last_shown';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const isStandalone = () => (
  window.matchMedia?.('(display-mode: standalone)').matches
  || window.navigator.standalone === true
);

const canShowPrompt = () => {
  const lastShown = Number(localStorage.getItem(PROMPT_STORAGE_KEY) || 0);
  return !lastShown || Date.now() - lastShown > SEVEN_DAYS_MS;
};

const PWAInstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isStandalone() || !canShowPrompt()) return undefined;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setShowPrompt(true);
      localStorage.setItem(PROMPT_STORAGE_KEY, String(Date.now()));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleInstalled = () => {
      setShowPrompt(false);
      setInstallEvent(null);
    };

    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;

    installEvent.prompt();
    await installEvent.userChoice;
    setShowPrompt(false);
    setInstallEvent(null);
  };

  const handleLater = () => {
    localStorage.setItem(PROMPT_STORAGE_KEY, String(Date.now()));
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed bottom-24 left-4 right-4 z-[90] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] rounded-3xl border border-[#39FF14]/30 bg-[#111625]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden"
        >
          <div className="h-1.5 bg-[#39FF14]" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center shrink-0">
                <Download size={22} className="text-[#39FF14]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-black text-base">Install PlayNow</h3>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  Get quicker access to venues, bookings and match updates from your home screen.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLater}
                className="text-gray-500 hover:text-white transition"
                aria-label="Close install prompt"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleLater}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white hover:bg-white/10 transition"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-2xl bg-[#39FF14] px-4 py-3 text-sm font-black text-black hover:bg-[#32E612] transition"
              >
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
