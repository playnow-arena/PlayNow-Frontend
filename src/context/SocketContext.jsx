import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to the backend
    const newSocket = io(API_BASE_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: localStorage.getItem('playnow_token')
      }
    });

    setSocket(newSocket);
    let healthInterval;
    const emitVisibility = () => {
      newSocket.emit('app_visibility', {
        visible: document.visibilityState === 'visible' && document.hasFocus()
      });
    };

    newSocket.on('connect', () => {
      emitVisibility();
      console.log('🔌 [SOCKET] Connected:', newSocket.id);
      
      // Heartbeat / Health Check
      clearInterval(healthInterval);
      healthInterval = setInterval(() => {
        newSocket.emit('ping_health');
      }, 30000); // Check every 30s

      newSocket.on('pong_health', (data) => {
        // Connection is alive
      });

      // If user is logged in, join their private owner room
      if (user && (user.role === 'owner' || user.roles?.includes('owner'))) {
        newSocket.emit('join_owner_room', user.id || user._id || user.playNowId);
      }

      // If user is logged in, join their private user room for notifications
      if (user) {
        newSocket.emit('join_user_room', user.id || user._id);
      }

    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 [SOCKET] Connection error:', error.message);
    });

    document.addEventListener('visibilitychange', emitVisibility);
    window.addEventListener('focus', emitVisibility);
    window.addEventListener('blur', emitVisibility);

    return () => {
      newSocket.emit('app_visibility', { visible: false });
      clearInterval(healthInterval);
      newSocket.off('pong_health');
      document.removeEventListener('visibilitychange', emitVisibility);
      window.removeEventListener('focus', emitVisibility);
      window.removeEventListener('blur', emitVisibility);
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
