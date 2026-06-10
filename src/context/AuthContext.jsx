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

  const login = async (userData) => {
    const fullUserData = {
      ...userData,
      id: userData._id,
      isVerified: true,
    };
    console.log('Login called with userData:', userData);
    console.log('Extracted role (userData.role):', userData.role);
    console.log('Extracted role (userData.user?.role):', userData.user?.role);
    setUser(fullUserData);
    localStorage.setItem('playnow_user', JSON.stringify(fullUserData));
    if (userData.token) {
      localStorage.setItem('playnow_token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('playnow_user');
    localStorage.removeItem('playnow_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
