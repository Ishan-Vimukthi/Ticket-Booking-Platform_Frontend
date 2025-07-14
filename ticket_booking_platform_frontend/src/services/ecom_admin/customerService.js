// Customer Service - Ready for backend integration

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

// Mock customers data
const mockCustomers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    totalOrders: 15,
    totalSpent: 899.75,
    joinedDate: '2024-01-15T00:00:00Z',
    status: 'active'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    address: '456 Oak Ave, City, State 67890',
    totalOrders: 8,
    totalSpent: 445.50,
    joinedDate: '2024-02-20T00:00:00Z',
    status: 'active'
  }
];

export const customerService = {
  // Get all customers with analytics
  async getAllCustomers(params = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      if (params.search) queryParams.append('search', params.search);

      const url = `${API_BASE_URL}/customers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        // Return mock data for demonstration silently
        await new Promise(resolve => setTimeout(resolve, 500));
        return { 
          success: true, 
          data: mockCustomers,
          needsFallback: true
        };
      }

      const data = await response.json();
      
      // Handle both old and new backend response formats
      // New format: {"success":true,"data":[...]}
      // Old format: {"status":"SUCCESS","data":[...]}
      const isSuccess = data.success === true || data.status === "SUCCESS";
      const customers = data.data || data.customers || [];
      
      if (!isSuccess) {
        throw new Error(data.message || 'Failed to fetch customers');
      }
      
      // Transform backend data to frontend format
      const transformedCustomers = customers.map(customer => ({
        _id: customer.id || customer._id || customer.email,
        id: customer.id || customer._id || customer.email,
        email: customer.email,
        name: customer.name || customer.full_name || customer.email, // Handle both name and full_name
        phone: customer.phone || 'N/A',
        address: customer.address || {},
        customerType: customer.customerType || 'New', // Use customerType from backend
        // Map backend stats to frontend expected format
        orderCount: customer.stats?.totalOrders || customer.totalOrders || 0,
        totalSpent: customer.stats?.totalSpent || customer.totalSpent || 0,
        firstOrderDate: customer.stats?.firstOrderDate || customer.firstOrderDate || customer.createdAt,
        lastOrderDate: customer.stats?.lastOrderDate || customer.lastOrderDate || customer.updatedAt,
        // Keep original structure for compatibility
        totalOrders: customer.stats?.totalOrders || customer.totalOrders || 0,
        // Ensure stats object exists for compatibility
        stats: {
          totalOrders: customer.stats?.totalOrders || customer.totalOrders || 0,
          totalSpent: customer.stats?.totalSpent || customer.totalSpent || 0,
          firstOrderDate: customer.stats?.firstOrderDate || customer.firstOrderDate || customer.createdAt,
          lastOrderDate: customer.stats?.lastOrderDate || customer.lastOrderDate || customer.updatedAt
        }
      }));
      
      return { 
        success: true, 
        data: transformedCustomers,
        pagination: data.pagination || null
      };
      
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return { 
        success: true, 
        data: mockCustomers,
        needsFallback: true
      };
    }
  },

  // Get customer analytics dashboard data
  async getCustomerAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/analytics`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        return { success: false, needsFallback: true };
      }

      const data = await response.json();
      
      // Handle both old and new backend response formats
      // New format: {"success":true,"data":{"totalCustomers":3,"customersByType":{"loyal":1,"regular":1,"new":1}}}
      // Old format: {"status":"SUCCESS","data":{...}}
      const isSuccess = data.success === true || data.status === "SUCCESS";
      const analyticsData = data.data || data;
      
      if (!isSuccess) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
      
      return { 
        success: true, 
        data: {
          totalCustomers: analyticsData.totalCustomers || 0,
          newCustomersThisMonth: analyticsData.newCustomersThisMonth || 0,
          totalRevenue: analyticsData.totalRevenue || 0,
          averageOrderValue: analyticsData.averageOrderValue || 0,
          customerGrowthRate: analyticsData.customerGrowthRate || 0,
          totalOrders: analyticsData.totalOrders || 0
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching customer analytics:', error);
      return { success: false, error: error.message, needsFallback: true };
    }
  },

  // Get single customer by ID
  async getCustomerById(id) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const customer = mockCustomers.find(c => c._id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return { success: true, data: customer };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.customer || data };
      */
    } catch (error) {
      console.error('Error fetching customer:', error);
      return { success: false, error: error.message };
    }
  },

  // Search customers
  async searchCustomers(query) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = mockCustomers.filter(customer => 
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, data: filtered };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.customers || data };
      */
    } catch (error) {
      console.error('Error searching customers:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get customer type from customer data
   * @param {Object} customer - Customer object from API
   * @returns {string} Customer type
   */
  getCustomerType(customer) {
    // If customerType is already in the response, use it
    if (customer.customerType) {
      return customer.customerType;
    }
    
    // Fallback: Calculate customer type based on stats
    if (customer.stats) {
      const { totalSpent, totalOrders } = customer.stats;
      
      if (totalSpent >= 500) return 'VIP';
      if (totalOrders >= 5) return 'Loyal';
      if (totalOrders >= 2) return 'Regular';
      return 'New';
    }
    
    // Fallback: Calculate from direct fields
    if (customer.orderCount !== undefined && customer.totalSpent !== undefined) {
      if (customer.totalSpent >= 500) return 'VIP';
      if (customer.orderCount >= 5) return 'Loyal';
      if (customer.orderCount >= 2) return 'Regular';
      return 'New';
    }
    
    return 'New'; // Default fallback
  },

  /**
   * Get customer type badge color
   * @param {string} type - Customer type
   * @returns {string} Badge color class
   */
  getCustomerTypeColor(type) {
    switch (type?.toLowerCase()) {
      case 'vip': 
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'loyal': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'regular': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': 
        return 'bg-green-100 text-green-800 border-green-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },

  /**
   * Format customer type for display
   * @param {string} type - Customer type
   * @returns {string} Formatted type
   */
  formatCustomerType(type) {
    switch (type?.toLowerCase()) {
      case 'vip': return '🔥 VIP';
      case 'loyal': return '⭐ Loyal';
      case 'regular': return '👤 Regular';
      case 'new': return '🆕 New';
      default: return '👤 Customer';
    }
  },

  // Alias for dashboard compatibility - ADDED FOR DASHBOARD INTEGRATION
  async getCustomers(params = {}) {
    try {
      const result = await this.getAllCustomers(params);
      
      // Ensure consistent return format for dashboard
      return {
        success: result.success,
        customers: result.customers || result.data || [],
        data: result.customers || result.data || []
      };
    } catch (error) {
      console.error('❌ Error in getCustomers:', error);
      return { 
        success: false, 
        error: error.message,
        customers: [],
        data: []
      };
    }
  }
};

export default customerService;
