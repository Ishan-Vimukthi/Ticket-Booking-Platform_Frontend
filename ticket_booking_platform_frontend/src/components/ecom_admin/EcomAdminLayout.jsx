import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEcomAdmin } from '../../contexts/EcomAdminContext';

const EcomAdminLayout = ({ children }) => {
  const { userData, logout } = useEcomAdmin();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={logout} />
      <div className="flex-1 ml-64">
        <Header
          userName={userData?.name || userData?.email || 'E-commerce Admin'}
          userEmail={userData?.email}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EcomAdminLayout;
