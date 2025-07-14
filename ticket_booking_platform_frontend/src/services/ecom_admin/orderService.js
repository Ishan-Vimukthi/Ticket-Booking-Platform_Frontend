// Order Service - Ready for backend integration

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

// Mock orders data
const mockOrders = [
  {
    _id: '1',
    orderNumber: 'ORD-2024-001',
    customer: { name: 'John Doe', email: 'john@example.com' },
    items: [
      { product: 'Classic T-Shirt', quantity: 2, price: 29.99 }
    ],
    total: 59.98,
    status: 'completed',
    shippingAddress: '123 Main St, City, State 12345',
    createdAt: '2024-07-01T10:30:00Z'
  },
  {
    _id: '2',
    orderNumber: 'ORD-2024-002',
    customer: { name: 'Jane Smith', email: 'jane@example.com' },
    items: [
      { product: 'Premium Organic T-Shirt', quantity: 1, price: 39.99 }
    ],
    total: 39.99,
    status: 'pending',
    shippingAddress: '456 Oak Ave, City, State 67890',
    createdAt: '2024-07-02T14:15:00Z'
  }
];

export const orderService = {
  // Get all orders
  async getAllOrders() {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: mockOrders };

      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.orders || data };
      */
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  },

  // Get single order by ID
  async getOrderById(id) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const order = mockOrders.find(o => o._id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      return { success: true, data: order };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.order || data };
      */
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error.message };
    }
  },

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      const order = mockOrders.find(o => o._id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      order.status = status;
      return { success: true, data: order };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const data = await response.json();
      return { success: true, data: data.order || data };
      */
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }
};

export default orderService;
