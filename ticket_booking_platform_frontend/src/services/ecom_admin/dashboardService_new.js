// Dashboard Service - Real backend integration
import { productService } from './productService.js';
import { customerService } from './customerService.js';
import { orderService } from './orderService.js';

const API_BASE_URL = import.meta.env.VITE_ECOM_API_URL || 'http://localhost:3000/api/ecom';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('ecom_token');
};

// Create headers with authentication
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const dashboardService = {
  // Get comprehensive dashboard statistics using real data
  async getDashboardStats() {
    try {
      console.log('📊 Fetching real dashboard statistics...');
      
      // Fetch data from all services in parallel
      const [productsResult, customersResult, ordersResult, recycledResult] = await Promise.allSettled([
        productService.getProducts(),
        customerService.getCustomers(),
        orderService.getOrders(),
        productService.getRecycledProducts()
      ]);

      // Process products data
      const products = productsResult.status === 'fulfilled' && productsResult.value.success 
        ? productsResult.value.products || [] 
        : [];
      
      // Process customers data  
      const customers = customersResult.status === 'fulfilled' && customersResult.value.success
        ? customersResult.value.customers || []
        : [];

      // Process orders data
      const orders = ordersResult.status === 'fulfilled' && ordersResult.value.success
        ? ordersResult.value.orders || []
        : [];

      // Process recycled products data
      const recycledProducts = recycledResult.status === 'fulfilled' && recycledResult.value.success
        ? recycledResult.value.products || []
        : [];

      // Calculate statistics
      const totalProducts = products.length;
      const totalCustomers = customers.length;
      const totalOrders = orders.length;
      const totalRecycledProducts = recycledProducts.length;

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((sum, order) => {
        const amount = parseFloat(order.amount || order.total || 0);
        return sum + amount;
      }, 0);

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5)
        .map(order => ({
          id: order._id || order.id,
          customer: order.customer_name || order.customerName || 'Unknown',
          amount: parseFloat(order.amount || order.total || 0),
          status: order.status || 'pending',
          date: order.createdAt || order.date
        }));

      // Get low stock products (stock < 10)
      const lowStockProducts = products
        .filter(product => product.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5)
        .map(product => ({
          id: product._id || product.id,
          name: product.name,
          stock: product.stock,
          sku: product.sku
        }));

      // Calculate additional metrics
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Get top products by stock
      const topProducts = products
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 3)
        .map(product => ({
          name: product.name,
          stock: product.stock,
          price: product.price
        }));

      const dashboardStats = {
        totalProducts,
        totalCustomers, 
        totalOrders,
        totalRevenue,
        totalRecycledProducts,
        averageOrderValue,
        recentOrders,
        lowStockProducts,
        topProducts,
        // Additional insights
        insights: {
          stockStatus: lowStockProducts.length > 0 ? 'warning' : 'good',
          revenueGrowth: totalRevenue > 100 ? 'positive' : 'neutral',
          orderFrequency: totalOrders > 5 ? 'high' : 'moderate'
        }
      };

      console.log('✅ Dashboard stats calculated:', dashboardStats);
      return { success: true, data: dashboardStats };

    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Get quick metrics for header display
  async getQuickMetrics() {
    try {
      const result = await this.getDashboardStats();
      if (result.success) {
        const { totalProducts, totalCustomers, totalOrders, totalRevenue } = result.data;
        return {
          success: true,
          metrics: { totalProducts, totalCustomers, totalOrders, totalRevenue }
        };
      }
      return result;
    } catch (error) {
      console.error('Error fetching quick metrics:', error);
      return { success: false, error: error.message };
    }
  }
};

export default dashboardService;
