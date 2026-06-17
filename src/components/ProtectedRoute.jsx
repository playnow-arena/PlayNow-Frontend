import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Not logged in: redirect to the appropriate portal
    if (requiredRoles.includes('admin')) {
      return <Navigate to="/login" replace />;
    }
    if (requiredRoles.includes('owner')) {
      return <Navigate to="/partner/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = requiredRoles.length === 0 ||
    requiredRoles.includes(user.role) ||
    (Array.isArray(user.roles) && user.roles.some((role) => requiredRoles.includes(role)));

  if (!hasRequiredRole) {
    // Logged in but wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
