import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminProtectedRoute() {
  const { isAdminAuth } = useAuth();

  if (!isAdminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
