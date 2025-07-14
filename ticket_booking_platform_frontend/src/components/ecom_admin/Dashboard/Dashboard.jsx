import React, { useState, useEffect } from 'react';
import { Package, Users, FileText, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, isLoading = false }) => {
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

const Dashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call - you can replace this with actual API calls
        setTimeout(() => {
          setOverviewData({
            counts: {
              products: 25,
              customers: 187,
              orders: 64,
              revenue: 12850
            }
          });
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard fetch error:', err);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="T-Shirts" 
          value={overviewData?.counts.products || 0} 
          icon={<Package />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Customers" 
          value={overviewData?.counts.customers || 0} 
          icon={<Users />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Orders" 
          value={overviewData?.counts.orders || 0} 
          icon={<FileText />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Revenue" 
          value={overviewData ? `$${overviewData.counts.revenue.toLocaleString()}` : '$0'} 
          icon={<DollarSign />} 
          isLoading={isLoading}
        />
      </div>

      {/* Welcome Message */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to T-Shirt Store Admin</h2>
        <p className="text-gray-600">
          Manage your t-shirt inventory, track orders, and monitor your business performance from this central hub.
        </p>
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded">
            Sales charts will be implemented with real data
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Popular Products</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded">
            Product performance charts coming soon
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Stock Status</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded">
            Stock management interface coming soon
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded">
            Recent orders list coming soon
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
