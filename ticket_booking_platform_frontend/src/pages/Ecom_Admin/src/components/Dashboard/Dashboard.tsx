import React, { useState, useEffect } from 'react';
import { Package, Users, FileText, DollarSign } from 'lucide-react';
import StatCard from './StatCard';
import RevenueChart from './Charts/RevenueChart';
import CategoryChart from './Charts/CategoryChart';
import StockChart from './Charts/StockChart';
import RecentOrders from './RecentOrders';
import LowStockAlert from './LowStockAlert';
import dashboardService from '../../services/dashboardService';
import { DashboardOverview, RevenueData, StockData } from './dashboardTypes';

const Dashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { overview, revenue, stock } = await dashboardService.fetchAllDashboardData();

        setOverviewData(overview);
        setRevenueData(revenue);
        setStockData(stock);

        if (!overview && !revenue && !stock) {
          setError('Failed to fetch dashboard data');
        }

      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard fetch error:', err);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Products" 
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
          value={revenueData ? `$${revenueData.summary.totalRevenue.toLocaleString()}` : '$0'} 
          icon={<DollarSign />} 
          isLoading={isLoading}
        />
      </div>

      {/* Low Stock Alert */}
      {overviewData?.lowStockItems && overviewData.lowStockItems.length > 0 && (
        <LowStockAlert items={overviewData.lowStockItems} />
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueData && revenueData.revenueByPeriod.length > 0 ? (
          <RevenueChart data={revenueData.revenueByPeriod} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          </div>
        )}
        
        {overviewData?.salesByCategory && overviewData.salesByCategory.length > 0 ? (
          <CategoryChart data={overviewData.salesByCategory} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sales by Categories</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              No category data available
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stockData ? (
          <StockChart data={stockData} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Stock Status</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              No stock data available
            </div>
          </div>
        )}
        
        {overviewData?.recentOrders && overviewData.recentOrders.length > 0 ? (
          <RecentOrders orders={overviewData.recentOrders} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              No recent orders
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;