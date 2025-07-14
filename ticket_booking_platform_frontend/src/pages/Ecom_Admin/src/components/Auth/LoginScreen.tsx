import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../Loading/LoadingSpinner';
import { loginUser } from '../../services/authService';

interface UserData {
  id: string;
  email: string;
  name?: string;
}

interface LoginScreenProps {
  onLogin: (userData: UserData, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await loginUser(email, password);
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(data.user));
      // Call the onLogin handler from parent component
      onLogin(data.user, data.token);
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
         style={{
           backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      {isLoading && <LoadingSpinner />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-indigo-600"
          >
            BigIdea
          </motion.h1>
          <p className="text-gray-500">Store</p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-6">Log in to access your account</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              title="Email Address"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              title="Password"
              placeholder="Enter your password"
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginScreen;