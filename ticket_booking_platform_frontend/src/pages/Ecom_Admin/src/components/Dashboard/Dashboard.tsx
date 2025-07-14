import React, { useState, useEffect } from 'react';
import { Package, Users, FileText, DollarSign } from 'lucide-react';
import StatCard from './StatCard';
import RevenueChart from './Charts/RevenueChart';
import CategoryChart from './Charts/CategoryChart';
import StockChart from './Charts/StockChart';
import RecentOrders from './RecentOrders';
import LowStockAlert from './LowStockAlert';
// import dashboardService from '../../services/dashboardService';
import { DashboardOverview, RevenueData, StockData } from './dashboardTypes';

const Dashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [recentOrdersList, setRecentOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use real e-commerce endpoints instead of mock service
        const API_BASE_URL = import.meta.env.VITE_ECOM_API_URL || 'http://localhost:3000/api/ecom';
        const token = localStorage.getItem('ecom_token');
        
        if (!token) {
          throw new Error('No authentication token found. Please login with admin@gmail.com / admin123');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch real data from e-commerce endpoints
        const [productsRes, customersRes, ordersRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/products`, { headers }),
          fetch(`${API_BASE_URL}/customers`, { headers }),
          fetch(`${API_BASE_URL}/payments/orders`, { headers })
        ]);

        // Process products
        let totalProducts = 0;
        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
          const productsData = await productsRes.value.json();
          totalProducts = productsData.data?.length || 0;
        }

        // Process customers  
        let totalCustomers = 0;
        if (customersRes.status === 'fulfilled' && customersRes.value.ok) {
          const customersData = await customersRes.value.json();
          totalCustomers = customersData.data?.length || 0;
        }

        // Process orders
        let totalOrders = 0;
        let totalRevenue = 0;
        let recentOrdersList: any[] = [];
        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
          const ordersData = await ordersRes.value.json();
          const orders = ordersData.data?.orders || [];
          totalOrders = orders.length;
          totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.amount || 0), 0);
          
          // Get recent orders for display with customer info
          recentOrdersList = orders
            .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
            .slice(0, 5)
            .map((order: any) => ({
              id: order._id || order.id,
              customer: {
                id: order.customerId || 'unknown',
                firstName: (order.customerInfo?.name || order.customer?.name || 'Unknown').split(' ')[0] || 'Unknown',
                lastName: (order.customerInfo?.name || order.customer?.name || 'Customer').split(' ')[1] || 'Customer',
                name: order.customerInfo?.name || order.customer?.name || 'Unknown Customer',
                email: order.customerInfo?.email || order.customer?.email || 'no-email@example.com',
                phone: order.customerInfo?.phone || order.customer?.phone || 'N/A',
                address: order.customerInfo?.address?.street || 'N/A',
                city: order.customerInfo?.address?.city || 'N/A',
                state: order.customerInfo?.address?.state || 'N/A'
              },
              amount: parseFloat(order.amount || order.total || 0),
              status: order.status || 'pending',
              date: order.createdAt || order.date
            }));
        }

        // Create overview data matching the expected types
        const overview: DashboardOverview = {
          counts: {
            products: totalProducts,
            customers: totalCustomers,
            orders: totalOrders,
            revenue: totalRevenue
          },
          monthlyStats: {
            totalRevenue,
            orderCount: totalOrders,
            avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
          },
          recentOrders: recentOrdersList.map(order => ({
            id: order.id,
            date: order.date,
            amount: order.amount,
            status: order.status
          })),
          lowStockItems: [],
          salesByCategory: []
        };

        // Create revenue data matching expected types
        const revenue: RevenueData = {
          summary: {
            totalRevenue,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
          },
          revenueByPeriod: []
        };

        setOverviewData(overview);
        setRevenueData(revenue);
        setStockData(null); // We don't have stock chart data yet
        setRecentOrdersList(recentOrdersList);

      } catch (err: any) {
        setError('Failed to fetch dashboard data: ' + (err.message || 'Unknown error'));
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
          <RecentOrders orders={recentOrdersList as any} />
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