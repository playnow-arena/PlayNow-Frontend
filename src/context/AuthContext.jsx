import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user on load
    const savedUser = localStorage.getItem('playnow_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user');
        localStorage.removeItem('playnow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const playNowId = userData.playNowId || userData.id || `PN-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullUserData = { ...userData, id: playNowId, isVerified: true };
    setUser(fullUserData);
    localStorage.setItem('playnow_user', JSON.stringify(fullUserData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('playnow_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
