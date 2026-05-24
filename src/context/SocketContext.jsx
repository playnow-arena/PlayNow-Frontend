import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to the backend
    const newSocket = io({
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 [SOCKET] Connected:', newSocket.id);
      
      // Heartbeat / Health Check
      const healthInterval = setInterval(() => {
        newSocket.emit('ping_health');
      }, 30000); // Check every 30s

      newSocket.on('pong_health', (data) => {
        // Connection is alive
      });

      // If user is logged in, join their private owner room
      if (user && (user.role === 'owner' || user.roles?.includes('owner'))) {
        newSocket.emit('join_owner_room', user.playNowId || user.playNowId);
      }

      return () => clearInterval(healthInterval);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 [SOCKET] Connection error:', error.message);
    });

    return () => {
      newSocket.off('pong_health');
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
