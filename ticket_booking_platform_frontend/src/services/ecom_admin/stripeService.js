// Stripe Payment Service - E-commerce Integration
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

export const stripeService = {
  // Get Stripe configuration (publishable key)
  async getStripeConfig() {
    try {
      console.log('🔑 Getting Stripe configuration from backend...');
      
      const response = await fetch(`${API_BASE_URL}/payments/config`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        console.warn(`⚠️ Backend config failed with status: ${response.status}`);
        const errorText = await response.text();
        console.warn('Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Stripe config received from backend:', result);
      
      if (result.success && result.data && result.data.publishableKey) {
        return { 
          success: true, 
          publishableKey: result.data.publishableKey 
        };
      } else {
        throw new Error('Invalid response format: missing publishableKey');
      }
    } catch (error) {
      console.error('❌ Error getting Stripe config from backend:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Check stock before payment
  async checkStock(productId, quantity) {
    try {
      console.log(`📦 Checking stock for product ${productId}, quantity: ${quantity}`);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}/check-stock`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Stock check completed:', result);
      
      return { 
        success: true, 
        data: result.data 
      };
    } catch (error) {
      console.error('❌ Error checking stock:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Create payment intent (Step 1)
  async createPaymentIntent(paymentData) {
    try {
      console.log('💳 Creating payment intent...');
      console.log('📤 Request data:', paymentData);
      
      const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(paymentData)
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Response error:', errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('📋 Full backend response:', result);
      
      // Handle different possible response structures
      let responseData;
      if (result.success && result.data) {
        responseData = result.data;
      } else if (result.clientSecret || result.client_secret) {
        // Direct response format
        responseData = result;
      } else {
        console.error('❌ Unexpected response format:', result);
        throw new Error('Invalid payment intent response format');
      }
      
      console.log('✅ Payment intent created successfully');
      console.log('📋 Extracted data:', responseData);
      
      return { 
        success: true, 
        data: responseData 
      };
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Confirm payment (Step 3)
  async confirmPayment(paymentIntentId) {
    try {
      console.log('✅ Confirming payment with backend...');
      
      const response = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ paymentIntentId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎉 Payment confirmed successfully:', result);
      
      return { 
        success: true, 
        data: result.data 
      };
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Get order details
  async getOrderDetails(orderId) {
    try {
      console.log('📋 Fetching order details for:', orderId);
      
      const response = await fetch(`${API_BASE_URL}/payments/order/${orderId}`, {
        method: 'GET',
        headers: createHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to fetch order details:', data);
        return { success: false, error: data.message || 'Failed to fetch order details' };
      }

      console.log('✅ Order details fetched successfully:', data);
      return { success: true, data: data.order };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return { success: false, error: error.message };
    }
  }
};
