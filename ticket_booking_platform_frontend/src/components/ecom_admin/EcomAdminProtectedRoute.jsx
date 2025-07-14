import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEcomAdmin } from '../../contexts/EcomAdminContext';

const EcomAdminProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useEcomAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/ecom_admin/login" replace />;
};

export default EcomAdminProtectedRoute;
