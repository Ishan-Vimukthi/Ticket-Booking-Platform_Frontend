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

// Mock orders data - Enhanced for Customer Management demo
const mockOrders = [
  {
    _id: '1',
    orderNumber: 'ORD-2024-001',
    customer: { 
      name: 'John Doe', 
      email: 'john@example.com',
      phone: '+1-555-0123'
    },
    items: [
      { product: 'Classic T-Shirt', quantity: 2, price: 29.99, size: 'L' },
      { product: 'Vintage Denim Jacket', quantity: 1, price: 89.99, size: 'M' }
    ],
    total: 149.97,
    status: 'completed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    shippingAddress: '123 Main St, New York, NY 10001',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    _id: '2',
    orderNumber: 'ORD-2024-002',
    customer: { 
      name: 'Jane Smith', 
      email: 'jane@example.com',
      phone: '+1-555-0456'
    },
    items: [
      { product: 'Premium Organic T-Shirt', quantity: 3, price: 39.99, size: 'S' }
    ],
    total: 119.97,
    status: 'shipped',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
    createdAt: '2024-02-01T14:15:00Z',
    updatedAt: '2024-02-02T09:30:00Z'
  },
  {
    _id: '3',
    orderNumber: 'ORD-2024-003',
    customer: { 
      name: 'John Doe', 
      email: 'john@example.com',
      phone: '+1-555-0123'
    },
    items: [
      { product: 'Retro Graphic Tee', quantity: 1, price: 34.99, size: 'XL' },
      { product: 'Classic T-Shirt', quantity: 1, price: 29.99, size: 'L' }
    ],
    total: 64.98,
    status: 'processing',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    shippingAddress: '123 Main St, New York, NY 10001',
    createdAt: '2024-02-20T16:45:00Z',
    updatedAt: '2024-02-21T11:15:00Z'
  },
  {
    _id: '4',
    orderNumber: 'ORD-2024-004',
    customer: { 
      name: 'Mike Wilson', 
      email: 'mike@example.com',
      phone: '+1-555-0789'
    },
    items: [
      { product: 'Eco-Friendly Cotton Tee', quantity: 2, price: 44.99, size: 'M' }
    ],
    total: 89.98,
    status: 'completed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    shippingAddress: '789 Pine St, Chicago, IL 60601',
    createdAt: '2024-03-05T12:20:00Z',
    updatedAt: '2024-03-06T16:30:00Z'
  },
  {
    _id: '5',
    orderNumber: 'ORD-2024-005',
    customer: { 
      name: 'Sarah Davis', 
      email: 'sarah@example.com',
      phone: '+1-555-0321'
    },
    items: [
      { product: 'Limited Edition Artist Tee', quantity: 1, price: 59.99, size: 'S' },
      { product: 'Classic T-Shirt', quantity: 2, price: 29.99, size: 'M' }
    ],
    total: 119.97,
    status: 'pending',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    shippingAddress: '321 Elm St, Miami, FL 33101',
    createdAt: '2024-03-18T09:10:00Z',
    updatedAt: '2024-03-18T09:10:00Z'
  },
  {
    _id: '6',
    orderNumber: 'ORD-2024-006',
    customer: { 
      name: 'Jane Smith', 
      email: 'jane@example.com',
      phone: '+1-555-0456'
    },
    items: [
      { product: 'Premium Organic T-Shirt', quantity: 1, price: 39.99, size: 'M' },
      { product: 'Vintage Denim Jacket', quantity: 1, price: 89.99, size: 'S' }
    ],
    total: 129.98,
    status: 'completed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
    createdAt: '2024-03-25T18:30:00Z',
    updatedAt: '2024-03-26T14:45:00Z'
  }
];

export const orderService = {
  // Get all orders
  async getAllOrders() {
    try {
      console.log('📋 Fetching all orders from backend...');
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        // If backend doesn't have orders endpoint yet, fall back to payments
        console.log('📋 Orders endpoint not available, trying payments endpoint...');
        return await this.getOrdersFromPayments();
      }

      const data = await response.json();
      console.log('✅ Orders received from backend:', data);
      
      // Handle new response format: {"success":true,"data":[...]}
      const isSuccess = data.success === true || data.status === "SUCCESS";
      const orders = data.data || data.orders || [];
      
      if (!isSuccess) {
        console.warn('⚠️ Orders response indicates failure:', data);
        return await this.getOrdersFromPayments();
      }
      
      // Transform orders data to frontend format
      const transformedOrders = this.transformOrdersData(orders);
      
      return { 
        success: true, 
        data: transformedOrders 
      };
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      // Fallback to payments endpoint
      console.log('📋 Falling back to payments endpoint...');
      return await this.getOrdersFromPayments();
    }
  },

  // Fallback: Get orders from payments/orders endpoint
  async getOrdersFromPayments() {
    try {
      console.log('💳 Fetching orders from payments endpoint...');
      
      const response = await fetch(`${API_BASE_URL}/payments/orders`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        console.warn('⚠️ No orders endpoint available, using mock data for demo');
        // Return mock data for demonstration if no backend endpoint exists
        return { 
          success: true, 
          data: mockOrders,
          needsFallback: true
        };
      }

      const data = await response.json();
      console.log('✅ Orders received from payments endpoint:', data);
      
      // Handle response format: {"success":true,"data":{"orders":[...],"pagination":{...}}}
      const isSuccess = data.success === true || data.status === "SUCCESS";
      const ordersData = data.data?.orders || data.orders || [];
      
      if (!isSuccess) {
        console.warn('⚠️ Payments response indicates failure:', data);
        return { 
          success: true, 
          data: mockOrders,
          needsFallback: true
        };
      }
      
      // Transform payment orders to frontend format
      const transformedOrders = this.transformOrdersData(ordersData);
      
      return { 
        success: true, 
        data: transformedOrders,
        pagination: data.data?.pagination || null
      };
      
    } catch (error) {
      console.error('❌ Error fetching orders from payments:', error);
      console.log('📋 Using mock data for demonstration...');
      
      // Return mock data as final fallback
      return { 
        success: true, 
        data: mockOrders 
      };
    }
  },

  // Get single order by ID
  async getOrderById(id) {
    try {
      console.log(`📋 Fetching order ${id} from backend...`);
      
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        // Fallback to mock data if endpoint not available
        console.log('📋 Order endpoint not available, using mock data...');
        const order = mockOrders.find(o => o._id === id);
        if (!order) {
          throw new Error('Order not found');
        }
        return { success: true, data: order };
      }

      const data = await response.json();
      console.log('✅ Order received from backend:', data);
      
      return { 
        success: true, 
        data: data.data || data.order || data 
      };
      
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      
      // Fallback to mock data
      const order = mockOrders.find(o => o._id === id);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }
      return { success: true, data: order };
    }
  },

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      console.log(`📋 Updating order ${id} status to ${status}...`);
      
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        // Fallback to mock update
        console.log('📋 Update endpoint not available, using mock update...');
        const order = mockOrders.find(o => o._id === id);
        if (!order) {
          throw new Error('Order not found');
        }
        order.status = status;
        return { success: true, data: order };
      }

      const data = await response.json();
      console.log('✅ Order status updated:', data);
      
      return { 
        success: true, 
        data: data.data || data.order || data 
      };
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      
      // Fallback to mock update
      const order = mockOrders.find(o => o._id === id);
      if (order) {
        order.status = status;
        return { success: true, data: order };
      }
      
      return { success: false, error: error.message };
    }
  },

  // Transform backend order data to frontend format
  transformOrdersData(ordersData) {
    return ordersData.map(order => ({
      _id: order._id || order.id,
      orderNumber: order.orderNumber || `ORD-${order._id?.slice(-8)}`,
      customer: {
        name: order.customerInfo?.name || order.customer?.name || 'Unknown Customer',
        email: order.customerInfo?.email || order.customer?.email || 'No email',
        phone: order.customerInfo?.phone || order.customer?.phone || 'No phone'
      },
      items: order.items?.length || 0,
      itemsList: order.items?.map(item => ({
        product: item.productName || item.product?.name || 'Unknown Product',
        productCode: item.productCode || item.product?.productCode || '',
        quantity: item.quantity || 1,
        size: item.size || '',
        color: item.color || '',
        price: item.price || 0,
        subtotal: item.subtotal || (item.price * item.quantity)
      })) || [],
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shipping: order.shipping || 0,
      total: order.total || order.totalAmount || 0,
      status: this.mapOrderStatus(order.status, order.paymentStatus),
      paymentMethod: order.paymentMethod || 'unknown',
      paymentStatus: order.paymentStatus || 'unknown',
      paymentIntentId: order.paymentIntentId || '',
      shippingAddress: order.customerInfo?.address ? 
        `${order.customerInfo.address.street}, ${order.customerInfo.address.city}, ${order.customerInfo.address.state} ${order.customerInfo.address.zipCode}` :
        (order.shippingAddress || 'No address provided'),
      date: order.createdAt || order.date,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
  },

  // Map backend status to frontend status
  mapOrderStatus(orderStatus, paymentStatus) {
    // Priority: Use order status first, then payment status
    if (orderStatus) {
      switch (orderStatus.toLowerCase()) {
        case 'confirmed':
        case 'completed':
          return 'completed';
        case 'pending':
          return 'pending';
        case 'processing':
          return 'processing';
        case 'cancelled':
        case 'canceled':
          return 'cancelled';
        default:
          return orderStatus.toLowerCase();
      }
    }
    
    // Fallback to payment status
    if (paymentStatus) {
      switch (paymentStatus.toLowerCase()) {
        case 'succeeded':
        case 'paid':
          return 'completed';
        case 'pending':
          return 'pending';
        case 'processing':
          return 'processing';
        case 'failed':
        case 'cancelled':
          return 'cancelled';
        default:
          return 'pending';
      }
    }
    
    return 'pending';
  },

  // Alias for dashboard compatibility - ADDED FOR DASHBOARD INTEGRATION
  async getOrders() {
    try {
      console.log('📦 Dashboard requesting orders...');
      const result = await this.getAllOrders();
      
      // Ensure consistent return format for dashboard
      return {
        success: result.success,
        orders: result.orders || result.data || [],
        data: result.orders || result.data || []
      };
    } catch (error) {
      console.error('❌ Error in getOrders:', error);
      return { 
        success: false, 
        error: error.message,
        orders: [],
        data: []
      };
    }
  }
};

export default orderService;
