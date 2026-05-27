import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminProtectedRoute({ requiredRole }) {
  const { isAdminAuth, isSuperAdmin, initialized } = useAuth();

  // Wait for auth to initialize
  if (!initialized) {
    return (
      <div className="min-h-screen bg-champagne flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cream-dark/30 border-t-espresso rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check for superadmin-only routes
  if (requiredRole === 'superadmin' && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
