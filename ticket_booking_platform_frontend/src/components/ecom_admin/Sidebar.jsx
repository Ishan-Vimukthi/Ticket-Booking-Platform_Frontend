import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Users, FileText, LogOut, Boxes, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/ecom_admin/dashboard' },
  { icon: Package, label: 'Products', path: '/ecom_admin/products' },
  { icon: Boxes, label: 'Stocks', path: '/ecom_admin/stocks' },
  { icon: Users, label: 'Customers', path: '/ecom_admin/customers' },
  { icon: FileText, label: 'Orders', path: '/ecom_admin/orders' },
  { icon: Trash2, label: 'Recycle Bin', path: '/ecom_admin/recycle-bin' },
];

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/ecom_admin/login');
  };

  return (
    <div className="bg-indigo-600 text-white w-64 h-screen fixed left-0 top-0 p-4 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold">BigIdea</h1>
        <p className="text-indigo-200">E-commerce Store</p>
      </motion.div>

      <nav className="flex-grow">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-2"
          >
            <button
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          </motion.div>
        ))}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-auto"
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-indigo-200 hover:bg-indigo-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Sidebar;
