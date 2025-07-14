export const loginUser = async (email, password) => {
    try {
      // Use real API integration
      const response = await fetch(`${import.meta.env.VITE_ECOM_API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        return data.data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

export const verifyToken = async (token) => {
  try {
    // Use real API integration
    const response = await fetch(`${import.meta.env.VITE_ECOM_API_URL}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    if (data.status === 'SUCCESS') {
      return data.data;
    } else {
      throw new Error(data.message || 'Token verification failed');
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

// Clear old authentication data for database separation
const clearOldAuthData = () => {
  const keysToRemove = ['ecom_token', 'ecom_user', 'token', 'user', 'admin_token', 'admin_user'];
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  console.log('🧹 Cleared old authentication data due to database separation');
};

// Initialize fresh session
export const initializeFreshSession = () => {
  clearOldAuthData();
  console.log('🔄 Initialized fresh e-commerce session with separated database');
};

// Test login with new credentials
export const testNewCredentials = async () => {
  try {
    console.log('🧪 Testing new admin credentials (admin@gmail.com/admin123)...');
    
    // Clear old data first
    clearOldAuthData();
    
    const result = await loginUser('admin@gmail.com', 'admin123');
    console.log('✅ New credentials test successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ New credentials test failed:', error);
    return { success: false, error: error.message };
  }
};
