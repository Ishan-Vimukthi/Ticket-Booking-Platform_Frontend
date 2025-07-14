import React from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  userName: string;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ userName, userEmail }) => {
  const location = useLocation();
  
  // Get page title and subtitle from current route
  const getPageInfo = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Welcome back' };
      case '/products':
        return { title: 'Products', subtitle: 'Manage your product inventory' };
      case '/stocks':
        return { title: 'Stocks', subtitle: 'Manage your stock levels' };
      case '/categories':
        return { title: 'Categories', subtitle: 'Manage product categories' };
      case '/customers':
        return { title: 'Customers', subtitle: 'Manage your customers' };
      case '/orders':
        return { title: 'Orders', subtitle: 'View and manage orders' };
      case '/recycle-bin':
        return { title: 'Recycle Bin', subtitle: 'Manage deleted items' };
      default:
        return { title: 'Dashboard', subtitle: 'Welcome back' };
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
            <p className="font-medium">{userName}</p>
            {userEmail && <p className="text-sm text-gray-500">{userEmail}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;