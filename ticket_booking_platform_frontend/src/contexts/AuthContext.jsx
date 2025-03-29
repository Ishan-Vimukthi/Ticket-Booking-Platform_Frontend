import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const response = await axios.get('http://localhost:3000/api/admins/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdmin(response.data.data.admin);
        }
      } catch (err) {
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:3000/api/admins/login', {
      email,
      password
    });
    localStorage.setItem('adminToken', response.data.token);
    setAdmin(response.data.data.admin);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);