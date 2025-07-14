import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = ({ userName, userEmail }) => {
  const location = useLocation();
  
  // Get page title and subtitle from current route
  const getPageInfo = (pathname) => {
    switch (pathname) {
      case '/ecom_admin/dashboard':
        return { title: 'E-commerce Dashboard', subtitle: 'Welcome back to your store management' };
      case '/ecom_admin/products':
        return { title: 'Products', subtitle: 'Manage your t-shirt inventory' };
      case '/ecom_admin/stocks':
        return { title: 'Stocks', subtitle: 'Manage your stock levels' };
      case '/ecom_admin/customers':
        return { title: 'Customers', subtitle: 'Manage your customers' };
      case '/ecom_admin/orders':
        return { title: 'Orders', subtitle: 'View and manage orders' };
      case '/ecom_admin/recycle-bin':
        return { title: 'Recycle Bin', subtitle: 'Manage deleted items' };
      default:
        return { title: 'E-commerce Dashboard', subtitle: 'Welcome back' };
    }
  };

  const { title, subtitle } = getPageInfo(location.pathname);

  return (
    <div className="bg-white p-4 flex justify-between items-center shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="font-medium">{userName || 'E-commerce Admin'}</p>
            {userEmail && <p className="text-sm text-gray-500">{userEmail}</p>}
          </div>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {(userName || 'EA').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
