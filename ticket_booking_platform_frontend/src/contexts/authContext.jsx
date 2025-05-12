import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if admin is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('/api/admins/profile', { withCredentials: true });
        setAdmin(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login admin
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        '/api/admins/login',
        { email, password },
        { withCredentials: true }
      );
      setAdmin(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Register admin (only for super admin)
  const register = async (name, email, password, isSuperAdmin) => {
    try {
      const res = await axios.post(
        '/api/admins',
        { name, email, password, isSuperAdmin },
        { withCredentials: true }
      );
      setAdmin(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Logout admin
  const logout = async () => {
    try {
      await axios.post('/api/admins/logout', {}, { withCredentials: true });
      setAdmin(null);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);