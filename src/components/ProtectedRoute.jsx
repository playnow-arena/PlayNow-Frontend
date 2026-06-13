import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Not logged in: redirect to the appropriate portal
    if (requiredRole === 'admin') {
      return <Navigate to="/login" replace />;
    }
    if (requiredRole === 'owner') {
      return <Navigate to="/partner/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = !requiredRole ||
    user.role === requiredRole ||
    (Array.isArray(user.roles) && user.roles.includes(requiredRole));

  if (!hasRequiredRole) {
    // Logged in but wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
