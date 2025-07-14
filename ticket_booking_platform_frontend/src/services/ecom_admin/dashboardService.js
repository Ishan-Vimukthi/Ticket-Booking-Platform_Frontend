// Dashboard Service - Ready for backend integration

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
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockStats = {
        totalProducts: 156,
        totalOrders: 1243,
        totalCustomers: 892,
        totalRevenue: 45670.50,
        recentOrders: [
          { id: 'ORD001', customer: 'John Doe', amount: 89.99, status: 'completed' },
          { id: 'ORD002', customer: 'Jane Smith', amount: 129.99, status: 'pending' },
          { id: 'ORD003', customer: 'Mike Johnson', amount: 59.99, status: 'shipped' }
        ],
        lowStockProducts: [
          { id: 'P001', name: 'Classic T-Shirt', stock: 5 },
          { id: 'P002', name: 'Premium Polo', stock: 3 }
        ]
      };
      
      return { success: true, data: mockStats };

      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data };
      */
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message };
    }
  }
};

export default dashboardService;
