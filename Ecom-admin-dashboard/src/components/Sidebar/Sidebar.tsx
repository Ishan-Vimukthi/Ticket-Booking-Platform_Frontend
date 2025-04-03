import React from 'react';
import { Home, Package, Grid, Users, FileText, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', value: 'dashboard' },
  { icon: Package, label: 'Products', value: 'products' },
  { icon: Grid, label: 'Categories', value: 'categories' },
  { icon: Users, label: 'Customers', value: 'customers' },
  { icon: FileText, label: 'Orders', value: 'orders' },
];

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage, onLogout }) => {
  return (
    <div className="bg-indigo-600 text-white w-64 min-h-screen p-4 flex flex-col">
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
              onClick={() => onNavigate(item.value)}
              className={`flex items-center space-x-2 p-3 rounded-lg mb-2 w-full text-left ${
                currentPage === item.value ? 'bg-indigo-700' : 'hover:bg-indigo-700'
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
          onClick={onLogout}
          className="flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-700 w-full text-left"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;