import React, { useState, useEffect } from 'react';
import { Package, Users, FileText, DollarSign, TrendingUp, AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardService } from '../../../services/ecom_admin/dashboardService.js';

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
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Fetching dashboard data...');
        const result = await dashboardService.getDashboardStats();
        
        if (result.success) {
          setDashboardData(result.data);
          console.log('✅ Dashboard data loaded:', result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }
        
      } catch (err) {
        setError('Failed to fetch dashboard data: ' + err.message);
        console.error('❌ Dashboard fetch error:', err);
      } finally {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="T-Shirts" 
          value={dashboardData?.totalProducts || 0} 
          icon={<Package />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Customers" 
          value={dashboardData?.totalCustomers || 0} 
          icon={<Users />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Orders" 
          value={dashboardData?.totalOrders || 0} 
          icon={<FileText />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Revenue" 
          value={dashboardData ? `$${dashboardData.totalRevenue.toFixed(2)}` : '$0.00'} 
          icon={<DollarSign />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Recycle Bin" 
          value={dashboardData?.totalRecycledProducts || 0} 
          icon={<Trash2 />} 
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

      {/* Real Data Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} />
            Recent Orders
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dashboardData?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order, index) => (
                <div key={order.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{order.customer}</div>
                    <div className="text-xs text-gray-500">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${order.amount.toFixed(2)}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent orders found
            </div>
          )}
        </div>
        
        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Stock Alerts
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dashboardData?.lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.lowStockProducts.map((product, index) => (
                <div key={product.id || index} className="flex justify-between items-center p-3 border-l-4 border-orange-400 bg-orange-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{product.stock} left</div>
                    <div className="text-xs text-orange-500">Low Stock</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-green-600 mb-2">✅ All products well stocked</div>
              <div className="text-sm">No low stock alerts</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Stock */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Top Products by Stock
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dashboardData?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">${product.price}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{product.stock} units</div>
                    <div className="text-xs text-green-500">In Stock</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}
        </div>
        
        {/* Business Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Business Insights</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dashboardData ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Average Order Value</div>
                <div className="text-lg font-bold text-blue-600">
                  ${dashboardData.averageOrderValue?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                dashboardData.insights?.stockStatus === 'warning' 
                  ? 'bg-orange-50' 
                  : 'bg-green-50'
              }`}>
                <div className={`font-medium ${
                  dashboardData.insights?.stockStatus === 'warning' 
                    ? 'text-orange-800' 
                    : 'text-green-800'
                }`}>
                  Stock Status
                </div>
                <div className={`text-lg font-bold ${
                  dashboardData.insights?.stockStatus === 'warning' 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  {dashboardData.insights?.stockStatus === 'warning' ? 'Needs Attention' : 'Healthy'}
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">Order Frequency</div>
                <div className="text-lg font-bold text-purple-600">
                  {dashboardData.insights?.orderFrequency || 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No insights available
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
