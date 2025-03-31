// contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set axios defaults
  axios.defaults.baseURL = 'http://localhost:3000/api';
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const response = await axios.get('/admins/me');
          setAdmin(response.data.data.admin);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login for:', email);
      
      const response = await axios.post('/admins/login', { 
        email: email.trim(),
        password: password.trim()
      });
      
      console.log('Login response:', response.data);
      
      const { token, data } = response.data;
      localStorage.setItem('adminToken', token);
      setAdmin(data.admin);
      navigate('/admin/dashboard');
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      const statusCode = err.response?.status;
      console.error(`Login failed with status ${statusCode}: ${errorMessage}`);
      setError(`${errorMessage} (${statusCode})`);
      return { success: false, error: errorMessage, status: statusCode };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      loading, 
      error,
      login, 
      logout,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);