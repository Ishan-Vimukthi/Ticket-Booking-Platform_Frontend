import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Grid, Users, FileText, LogOut, Boxes, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onLogout: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Boxes, label: 'Stocks', path: '/stocks' },
  { icon: Grid, label: 'Categories', path: '/categories' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: FileText, label: 'Orders', path: '/orders' },
  { icon: Trash2, label: 'Recycle Bin', path: '/recycle-bin' },
];

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="bg-indigo-600 text-white w-64 h-screen fixed left-0 top-0 p-4 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold">BigIdea</h1>
        <p className="text-indigo-200">Store</p>
      </motion.div>

      <nav className="flex-grow">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center space-x-2 p-3 rounded-lg mb-2 w-full text-left transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-700'
                  : 'hover:bg-indigo-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          </motion.div>
        ))}
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-700 w-full text-left transition-colors"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
