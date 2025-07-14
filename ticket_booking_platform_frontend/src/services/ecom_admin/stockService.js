// Stock Service - Ready for backend integration

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

// Mock stock data
const mockStocks = [
  {
    _id: '1',
    productId: '1',
    productName: 'Classic Cotton T-Shirt',
    sku: 'TS001',
    currentStock: 95,
    reorderLevel: 20,
    maxStock: 200,
    variants: [
      { size: 'S', color: 'Black', quantity: 15 },
      { size: 'M', color: 'Black', quantity: 25 },
      { size: 'L', color: 'Black', quantity: 20 },
      { size: 'S', color: 'White', quantity: 18 },
      { size: 'M', color: 'White', quantity: 17 }
    ],
    lastUpdated: '2024-07-01T10:00:00Z'
  },
  {
    _id: '2',
    productId: '2',
    productName: 'Premium Organic T-Shirt',
    sku: 'TS002',
    currentStock: 75,
    reorderLevel: 15,
    maxStock: 150,
    variants: [
      { size: 'S', color: 'Navy', quantity: 12 },
      { size: 'M', color: 'Navy', quantity: 20 },
      { size: 'L', color: 'Navy', quantity: 15 },
      { size: 'M', color: 'Green', quantity: 18 },
      { size: 'L', color: 'Green', quantity: 10 }
    ],
    lastUpdated: '2024-07-02T14:30:00Z'
  }
];

export const stockService = {
  // Get all stock levels
  async getAllStocks() {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: mockStocks };

      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await fetch(`${API_BASE_URL}/stocks`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.stocks || data };
      */
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return { success: false, error: error.message };
    }
  },

  // Get stock by product ID
  async getStockByProductId(productId) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const stock = mockStocks.find(s => s.productId === productId);
      if (!stock) {
        throw new Error('Stock not found');
      }
      return { success: true, data: stock };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/stocks/product/${productId}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.stock || data };
      */
    } catch (error) {
      console.error('Error fetching stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Update stock levels
  async updateStock(productId, stockData) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      const stockIndex = mockStocks.findIndex(s => s.productId === productId);
      if (stockIndex === -1) {
        throw new Error('Stock record not found');
      }
      
      mockStocks[stockIndex] = {
        ...mockStocks[stockIndex],
        ...stockData,
        lastUpdated: new Date().toISOString()
      };
      
      return { success: true, data: mockStocks[stockIndex] };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/stocks/product/${productId}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(stockData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock');
      }

      const data = await response.json();
      return { success: true, data: data.stock || data };
      */
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Get low stock alerts
  async getLowStockAlerts() {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 400));
      const lowStockItems = mockStocks.filter(stock => 
        stock.currentStock <= stock.reorderLevel
      );
      return { success: true, data: lowStockItems };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/stocks/low-stock`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.lowStockItems || data };
      */
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      return { success: false, error: error.message };
    }
  }
};

export default stockService;
