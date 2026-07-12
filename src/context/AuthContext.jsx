import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (userData) => {
  if (!userData) return null;

  const baseUser = userData.user && typeof userData.user === 'object'
    ? userData.user
    : userData;

  return {
    ...baseUser,
    id: baseUser._id || baseUser.id || userData._id || userData.id,
    role: baseUser.role || userData.role || baseUser.roles?.[0] || userData.roles?.[0],
    roles: baseUser.roles || userData.roles || (baseUser.role || userData.role ? [baseUser.role || userData.role] : []),
    email: baseUser.email || userData.email,
    isVerified: baseUser.isVerified ?? userData.isVerified ?? true,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedUser = async () => {
      // Check for saved user on load
      const savedUser = localStorage.getItem('playnow_user');
      const legacyToken = localStorage.getItem('token');
      const savedToken = localStorage.getItem('playnow_token') || legacyToken;
      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const normalizedUser = normalizeUser(parsedUser);
          setUser(normalizedUser);
          localStorage.setItem('playnow_user', JSON.stringify(normalizedUser));
          if (!localStorage.getItem('playnow_token') && legacyToken) {
            localStorage.setItem('playnow_token', legacyToken);
          }
        } catch (e) {
          console.error('Failed to parse saved user');
          localStorage.removeItem('playnow_user');
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const refreshedUser = normalizeUser(await res.json());
            setUser(refreshedUser);
            localStorage.setItem('playnow_user', JSON.stringify(refreshedUser));
          }
        } catch (e) {
          console.error('Failed to refresh saved user');
        }
      } else if (savedUser && !savedToken) {
        localStorage.removeItem('playnow_user');
      }
      setLoading(false);
    };

    loadSavedUser();
  }, []);

  const login = async (userData) => {
    const fullUserData = normalizeUser(userData);
    setUser(fullUserData);
    localStorage.setItem('playnow_user', JSON.stringify(fullUserData));
    if (userData.token) {
      localStorage.setItem('playnow_token', userData.token);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('playnow_token');
      const fcmToken = localStorage.getItem('playnow_fcm_token');
      
      if (token && fcmToken) {
        await fetch(`${API_BASE_URL}/api/notifications/fcm-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token: fcmToken, action: 'remove' }),
        }).catch(err => console.warn('[AUTH] FCM token removal failed during logout:', err));
      }
    } catch (error) {
      console.error('[AUTH] Logout cleanup error:', error);
    }

    setUser(null);
    localStorage.removeItem('playnow_user');
    localStorage.removeItem('playnow_token');
    localStorage.removeItem('token');
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
