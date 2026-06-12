import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (userData) => {
  if (!userData) return null;

  const baseUser = userData.user && typeof userData.user === 'object'
    ? userData.user
    : userData;

  return {
    ...baseUser,
    id: baseUser._id || baseUser.id || userData._id || userData.id,
    role: baseUser.role || userData.role,
    email: baseUser.email || userData.email,
    isVerified: baseUser.isVerified ?? userData.isVerified ?? true,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user on load
    const savedUser = localStorage.getItem('playnow_user');
    const savedToken = localStorage.getItem('playnow_token');
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const normalizedUser = normalizeUser(parsedUser);
        setUser(normalizedUser);
        localStorage.setItem('playnow_user', JSON.stringify(normalizedUser));
      } catch (e) {
        console.error('Failed to parse saved user');
        localStorage.removeItem('playnow_user');
      }
    } else if (savedUser && !savedToken) {
      localStorage.removeItem('playnow_user');
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    const fullUserData = normalizeUser(userData);
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

  const updateProfile = (userData) => {
    const fullUserData = normalizeUser(userData);
    setUser(fullUserData);
    localStorage.setItem('playnow_user', JSON.stringify(fullUserData));
    if (userData?.token) {
      localStorage.setItem('playnow_token', userData.token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
