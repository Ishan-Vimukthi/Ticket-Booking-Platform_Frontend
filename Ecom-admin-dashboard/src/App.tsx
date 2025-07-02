import React, { useState, useEffect } from 'react';
import { Package, Users, FileText, DollarSign } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import StatCard from './components/Dashboard/StatCard';
import GenderChart from './components/Dashboard/Charts/GenderChart';
import CategoryChart from './components/Dashboard/Charts/CategoryChart';
import LoginScreen from './components/Auth/LoginScreen';
import ProductList from './components/Products/ProductList';
import CategoryList from './components/Categories/CategoryList';
import CustomerList from './components/Customers/CustomerList';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token and user data on page load
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    // Verify token with backend
    fetch('http://localhost:3000/user/verify-token', {
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

  const handleLogin = (userData, token) => {
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

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductList />;
      case 'categories':
        return <CategoryList />;
      case 'customers':
        return <CustomerList />;
      default:
        return (
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard title="Products" value="54" icon={<Package />} />
              <StatCard title="Customers" value="541" icon={<Users />} />
              <StatCard title="Orders" value="54" icon={<FileText />} />
              <StatCard title="Revenue" value="$ 150K" icon={<DollarSign />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GenderChart />
              <CategoryChart />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        onNavigate={setCurrentPage} 
        currentPage={currentPage} 
        onLogout={handleLogout}
      />
      <div className="flex-1">
        <Header 
          currentPage={currentPage} 
          userName={userData?.name || 'User'} 
          userEmail={userData?.email} 
        />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;