import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../services/ecom_admin/authService';

const EcomAdminContext = createContext();

export const useEcomAdmin = () => {
  const context = useContext(EcomAdminContext);
  if (!context) {
    throw new Error('useEcomAdmin must be used within an EcomAdminProvider');
  }
  return context;
};

export const EcomAdminProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token and user data on page load
    const token = localStorage.getItem('ecom_token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Verify token with backend
    verifyToken(token)
      .then(data => {
        setUserData(data.user);
        setIsLoggedIn(true);
      })
      .catch(error => {
        console.error('Error verifying token:', error);
        localStorage.removeItem('ecom_token');
        localStorage.removeItem('ecom_userData');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('ecom_token', token);
    localStorage.setItem('ecom_userData', JSON.stringify(userData));
    setUserData(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('ecom_token');
    localStorage.removeItem('ecom_userData');
    setUserData(null);
    setIsLoggedIn(false);
  };

  const value = {
    isLoggedIn,
    userData,
    isLoading,
    login,
    logout
  };

  return (
    <EcomAdminContext.Provider value={value}>
      {children}
    </EcomAdminContext.Provider>
  );
};
