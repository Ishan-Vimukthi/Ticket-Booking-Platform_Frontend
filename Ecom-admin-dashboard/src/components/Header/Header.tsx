import React from 'react';

interface HeaderProps {
  currentPage: string;
  userName: string;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage, userName, userEmail }) => {
  let title, subtitle;

  switch (currentPage) {
    case 'dashboard':
      title = 'Dashboard';
      subtitle = 'Welcome back';
      break;
    case 'products':
      title = 'Products';
      subtitle = 'Manage your product inventory';
      break;
    case 'categories':
      title = 'Categories';
      subtitle = 'Manage product categories';
      break;
    case 'customers':
      title = 'Customers';
      subtitle = 'Manage your customers';
      break;
    case 'orders':
      title = 'Orders';
      subtitle = 'View and manage orders';
      break;
    default:
      title = 'Dashboard';
      subtitle = 'Welcome back';
  }

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