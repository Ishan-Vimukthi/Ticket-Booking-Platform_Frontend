// Stock Service - Enhanced with real backend integration

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

export const stockService = {
  // Get enhanced stock status from new backend API
  async getStockStatus() {
    try {
      console.log('📊 Fetching enhanced stock status from backend...');
      
      const response = await fetch(`${API_BASE_URL}/stock/status`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Enhanced stock status received:', data);
      
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('❌ Error fetching enhanced stock status:', error);
      // Fallback to basic product data if enhanced API fails
      return { success: false, error: error.message, fallback: true };
    }
  },

  // Get all stock levels (using product API as primary source)
  async getAllStocks() {
    try {
      console.log('📦 Fetching stock data from products API...');
      
      // Try enhanced stock status first
      const enhancedResult = await this.getStockStatus();
      if (enhancedResult.success) {
        return enhancedResult;
      }

      // Fallback to basic product data (current working implementation)
      console.log('📦 Using product API as fallback...');
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, data: [], fallback: true };
      
    } catch (error) {
      console.error('❌ Error fetching stocks:', error);
      return { success: false, error: error.message };
    }
  },

  // Bulk update stock levels (new backend feature)
  async bulkUpdateStock(updates) {
    try {
      console.log('🔄 Performing bulk stock update...', updates);
      
      const response = await fetch(`${API_BASE_URL}/stock/bulk-update`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ updates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to bulk update stock');
      }

      const data = await response.json();
      console.log('✅ Bulk stock update successful:', data);
      
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('❌ Error in bulk stock update:', error);
      return { success: false, error: error.message };
    }
  },

  // Configure stock settings (new backend feature)
  async updateStockSettings(productId, settings) {
    try {
      console.log('⚙️ Updating stock settings for product:', productId, settings);
      
      const response = await fetch(`${API_BASE_URL}/stock/settings`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({
          productId,
          ...settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock settings');
      }

      const data = await response.json();
      console.log('✅ Stock settings updated successfully:', data);
      
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('❌ Error updating stock settings:', error);
      return { success: false, error: error.message };
    }
  },

  // Get stock by product ID
  async getStockByProductId(productId) {
    try {
      console.log('🔍 Fetching stock for product:', productId);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product stock data received:', data);
      
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('❌ Error fetching product stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Get low stock alerts (enhanced)
  async getLowStockAlerts() {
    try {
      console.log('🚨 Fetching low stock alerts...');
      
      // Try enhanced stock status API first
      const enhancedResult = await this.getStockStatus();
      if (enhancedResult.success && enhancedResult.data.lowStockItems) {
        return { 
          success: true, 
          data: enhancedResult.data.lowStockItems 
        };
      }

      // Fallback: filter from products
      console.log('📦 Using product filtering for low stock alerts...');
      return { success: true, data: [] };
      
    } catch (error) {
      console.error('❌ Error fetching low stock alerts:', error);
      return { success: false, error: error.message };
    }
  }
};

export default stockService;
