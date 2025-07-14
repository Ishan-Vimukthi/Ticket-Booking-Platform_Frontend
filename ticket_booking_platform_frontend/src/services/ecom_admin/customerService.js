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
  // Get all customers
  async getAllCustomers() {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: mockCustomers };

      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await fetch(`${API_BASE_URL}/customers`, {
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
      console.error('Error fetching customers:', error);
      return { success: false, error: error.message };
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
  }
};

export default customerService;
