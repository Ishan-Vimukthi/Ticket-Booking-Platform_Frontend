import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isLoading = false }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white p-6 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm">{title}</h3>
          {isLoading ? (
            <div className="w-16 h-8 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
        </div>
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;