import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import LoginScreen from './components/Auth/LoginScreen';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import CategoryList from './components/Categories/CategoryList';
import CustomerList from './components/Customers/CustomerList';
import StockList from './components/Stocks/StockList';
import OrderList from './components/Order/OrderList';
import RecycleBinList from './components/Recyclebin/RecycleBinList';

export interface UserData {
  id: string;
  name?: string;
  email: string;
}

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; isLoggedIn: boolean }> = ({
  children,
  isLoggedIn
}) => {
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout component for authenticated pages
const Layout: React.FC<{
  children: React.ReactNode;
  userData: UserData | null;
  onLogout: () => void;
}> = ({ children, userData, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 ml-64">
        <Header
          userName={userData?.name || userData?.email || 'User'}
          userEmail={userData?.email}
        />
        {children}
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token and user data on page load
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Verify token with backend using environment variable
    fetch(`${import.meta.env.VITE_API_URL}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'SUCCESS') {
        setUserData(data.data.user);
        setIsLoggedIn(true);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    })
    .catch(error => {
      console.error('Error verifying token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleLogin = (userData: UserData, token: string) => {
    localStorage.setItem('token', token);
    setUserData(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUserData(null);
    setIsLoggedIn(false);
  };

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

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginScreen onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <ProductList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stocks"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <StockList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <CategoryList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <CustomerList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <OrderList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycle-bin"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Layout userData={userData} onLogout={handleLogout}>
                <RecycleBinList />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
