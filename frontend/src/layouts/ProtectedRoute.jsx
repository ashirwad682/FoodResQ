import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If logged in user doesn't match this portal's role, route to their appropriate dashboard
    if (role === 'DONOR') return <Navigate to="/donor/dashboard" replace />;
    if (role === 'NGO') return <Navigate to="/ngo/dashboard" replace />;
    if (role === 'VOLUNTEER') return <Navigate to="/volunteer/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};
