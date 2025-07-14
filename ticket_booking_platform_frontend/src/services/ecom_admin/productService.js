// Product Service - Updated for separated e-commerce database
import { categoryService } from './categoryService.js';

const API_BASE_URL = import.meta.env.VITE_ECOM_API_URL || 'http://localhost:3000/api/ecom';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('ecom_token');
};

// Clear old authentication data (for database separation)
const clearOldAuth = () => {
  // Clear any old tokens/data from shared database era
  const keysToRemove = ['ecom_token', 'ecom_user', 'token', 'user', 'admin_token'];
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  console.log('🧹 Cleared old authentication data');
};

// Create headers with authentication (for JSON requests)
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Create headers for FormData requests (no Content-Type)
const createFormDataHeaders = () => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Mock data for demonstration (remove when connecting to real backend)
const mockProducts = [
  {
    _id: '1',
    name: 'Classic Cotton T-Shirt',
    sku: 'TS001',
    description: 'A comfortable cotton t-shirt perfect for everyday wear',
    images: ['/images/products/tshirt1.jpg'],
    price: 29.99,
    quantity: 100,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Gray'],
    material: '100% Cotton',
    isActive: true,
    createdAt: '2024-07-01T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Premium Organic T-Shirt',
    sku: 'TS002',
    description: 'Eco-friendly organic cotton t-shirt with superior comfort',
    images: ['/images/products/tshirt2.jpg'],
    price: 39.99,
    quantity: 75,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Green', 'White'],
    material: '100% Organic Cotton',
    isActive: true,
    createdAt: '2024-07-02T00:00:00.000Z'
  }
];

export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      // Real API implementation:
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        // If unauthorized, might need to re-authenticate
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // If there's a network error, provide fallback
      if (error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please check if backend is running.' 
        };
      }
      
      return { success: false, error: error.message };
    }
  },

  // Get single product by ID
  async getProductById(id) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = mockProducts.find(p => p._id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      return { success: true, data: product };

      // Real API implementation:
      /*
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.product || data };
      */
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new product - EXACT BACKEND REQUIREMENTS
  async createProduct(productData) {
    try {
      console.log('🚀 Creating product with EXACT backend requirements...');
      
      // Step 1: Validate required fields
      if (!productData.name || !productData.description) {
        throw new Error('Product name and description are required');
      }

      // Step 2: Get authentication token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login with admin@gmail.com / admin123');
      }

      // Step 3: Get valid category ObjectId
      console.log('📁 Getting valid category ObjectId...');
      const categoriesResult = await categoryService.getAllCategories();
      if (!categoriesResult.success || categoriesResult.data.length === 0) {
        throw new Error('No categories available. Please create categories first.');
      }
      
      // Use the first available category ObjectId
      const category = categoriesResult.data[0];
      const categoryObjectId = category._id;
      console.log('✅ Using category ObjectId:', categoryObjectId);

      // Step 4: Prepare FormData (EXACT backend requirements)
      const formData = new FormData();
      
      // Required fields - EXACT format as backend expects
      formData.append('name', productData.name);                    // Required
      formData.append('description', productData.description);      // Required
      formData.append('category', categoryObjectId);                // Required (ObjectId)
      
      // E-commerce fields (Essential for shop functionality)
      formData.append('price', productData.price || 0);             // Price (default to 0)
      formData.append('quantity', productData.quantity || 0);       // Stock quantity (default to 0)
      
      // Product variants
      if (productData.sizes && productData.sizes.length > 0) {
        formData.append('sizes', JSON.stringify(productData.sizes)); // Array of sizes
      }
      if (productData.colors && productData.colors.length > 0) {
        formData.append('colors', JSON.stringify(productData.colors)); // Array of colors
      }
      
      // Additional optional fields
      if (productData.productCode) {
        formData.append('productCode', productData.productCode);
      }
      if (productData.material) {
        formData.append('material', productData.material);
      }
      if (productData.careInstructions) {
        formData.append('careInstructions', productData.careInstructions);
      }
      if (productData.isActive !== undefined) {
        formData.append('isActive', productData.isActive);
      }
      
      // Handle images if provided (Optional)
      if (productData.images && productData.images.length > 0) {
        console.log(`📷 Adding ${productData.images.length} images...`);
        for (let i = 0; i < productData.images.length; i++) {
          const image = productData.images[i];
          if (image instanceof File) {
            formData.append('images', image);    // Backend expects 'images' field
            console.log(`   - Image ${i + 1}: ${image.name} (${(image.size / 1024).toFixed(1)}KB)`);
          }
        }
      }

      // Step 5: Log FormData contents for debugging
      console.log('📤 FormData contents (EXACT backend format):');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`   ${key}: [File] ${value.name}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }

      // Step 6: Send request with EXACT backend requirements
      console.log('🌐 Sending POST request to backend...');
      console.log('📍 URL: http://localhost:3000/api/ecom/products');
      console.log('🔑 Authorization: Bearer', token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // DON'T set Content-Type for FormData - browser sets it automatically
        },
        body: formData
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again with admin@gmail.com / admin123');
        }
        
        let errorMessage = `Failed to create product (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Backend error response:', errorData);
        } catch (e) {
          console.error('❌ Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Product created successfully! Backend response:', data);
      
      return { 
        success: true, 
        data: data.data || data,
        message: `Product "${productData.name}" created successfully!`
      };
    } catch (error) {
      console.error('❌ Error creating product:', error);
      
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please check if the backend is running at http://localhost:3000'
        };
      }
      
      return { success: false, error: error.message };
    }
  },

  // Update product
  async updateProduct(id, productData) {
    try {
      console.log('🔄 Updating product:', id, productData);
      
      // Create FormData for product update
      const formData = new FormData();
      
      // Append all product fields
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('quantity', productData.quantity);
      formData.append('sku', productData.sku);
      formData.append('material', productData.material || '');
      formData.append('careInstructions', productData.careInstructions || '');
      formData.append('isActive', productData.isActive);
      
      // Add sizes and colors as JSON arrays
      formData.append('sizes', JSON.stringify(productData.sizes || []));
      formData.append('colors', JSON.stringify(productData.colors || []));
      
      // Add category (use same default as create)
      formData.append('category', '68739303f8b354a3f2094ea3');
      
      // Handle images
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: createFormDataHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product updated successfully:', data);
      
      return {
        success: true,
        data: data.product || data.data || data,
        message: data.message || 'Product updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete product (move to recycle bin)
  async deleteProduct(id) {
    try {
      console.log('🗑️ Moving product to recycle bin:', id);
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: createFormDataHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product moved to recycle bin successfully:', data);
      
      return {
        success: true,
        message: data.message || 'Product moved to recycle bin successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload product images
  async uploadImages(files) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const uploadedUrls = files.map((file, index) => 
        `/uploads/ecom/uploaded_${Date.now()}_${index}.jpg`
      );
      return { success: true, data: uploadedUrls };

      // Real API implementation:
      /*
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const response = await fetch(`${API_BASE_URL}/products/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }

      const data = await response.json();
      return { success: true, data: data.imageUrls || data };
      */
    } catch (error) {
      console.error('Error uploading images:', error);
      return { success: false, error: error.message };
    }
  },

  // Search products
  async searchProducts(query, filters = {}) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, data: filtered };

      // Real API implementation:
      /*
      const searchParams = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/products/search?${searchParams}`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.products || data };
      */
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, error: error.message };
    }
  },

  // Initialize fresh session (clear old data)
  initializeFreshSession() {
    clearOldAuth();
    console.log('🔄 Initialized fresh e-commerce session');
  },

  // Test login with new credentials
  async testLogin() {
    try {
      console.log('🧪 Testing login with new credentials...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@gmail.com',
          password: 'admin123'
        })
      });

      const result = await response.json();
      console.log('Login test result:', result);

      if (result.status === 'SUCCESS') {
        const token = result.data.token;
        localStorage.setItem('ecom_token', token);
        console.log('✅ Login successful with new credentials!');
        return { success: true, token, user: result.data.user };
      } else {
        console.log('❌ Login failed:', result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('❌ Login test error:', error);
      return { success: false, error: error.message };
    }
  },

  // Test complete workflow
  async testCompleteWorkflow() {
    try {
      console.log('🧪 Starting complete e-commerce workflow test...');
      
      // Step 1: Clear old data and login
      this.initializeFreshSession();
      const loginResult = await this.testLogin();
      if (!loginResult.success) {
        throw new Error('Login failed: ' + loginResult.error);
      }

      // Step 2: Ensure categories exist
      console.log('📁 Testing category creation...');
      const categoryResult = await categoryService.ensureDefaultCategory();
      if (!categoryResult.success) {
        throw new Error('Category creation failed: ' + categoryResult.error);
      }
      console.log('✅ Category ready:', categoryResult.data.name);

      // Step 3: Test product creation
      console.log('📦 Testing product creation...');
      const testProduct = {
        name: 'Test Product - DB Separation',
        description: 'Testing product creation with separated database',
        productCode: 'TEST-' + Date.now()
      };

      const productResult = await this.createProduct(testProduct);
      if (!productResult.success) {
        throw new Error('Product creation failed: ' + productResult.error);
      }
      console.log('✅ Product created:', productResult.data);

      // Step 4: Verify persistence
      console.log('🔍 Testing product persistence...');
      const allProducts = await this.getAllProducts();
      if (!allProducts.success) {
        throw new Error('Product retrieval failed: ' + allProducts.error);
      }

      const testProductExists = allProducts.data.find(p => p.name === testProduct.name);
      if (testProductExists) {
        console.log('✅ Product persistence confirmed!');
        return { 
          success: true, 
          message: 'Complete workflow test passed!',
          data: {
            login: loginResult,
            category: categoryResult.data,
            product: productResult.data,
            totalProducts: allProducts.data.length
          }
        };
      } else {
        throw new Error('Product not found after creation - persistence issue');
      }

    } catch (error) {
      console.error('❌ Workflow test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test with EXACT backend requirements
  async testBackendRequirements() {
    try {
      console.log('🧪 Testing EXACT Backend Requirements...');
      console.log('=' .repeat(50));
      
      // Step 1: Clear old authentication data
      this.initializeFreshSession();
      
      // Step 2: Login with exact credentials
      console.log('🔑 Step 1: Login with admin@gmail.com / admin123');
      const loginResult = await this.testLogin();
      if (!loginResult.success) {
        throw new Error('Login failed: ' + loginResult.error);
      }
      console.log('✅ Login successful, token received');
      
      // Step 3: Verify we have a valid category ObjectId
      console.log('📁 Step 2: Getting valid category ObjectId');
      const categoriesResult = await categoryService.getAllCategories();
      if (!categoriesResult.success || categoriesResult.data.length === 0) {
        throw new Error('No categories available - backend issue');
      }
      
      const category = categoriesResult.data[0];
      console.log('✅ Found category:', category.name, 'ObjectId:', category._id);
      
      // Step 4: Create product with EXACT format
      console.log('📦 Step 3: Creating product with EXACT backend format');
      const testProductData = {
        name: 'Backend Requirements Test Product',
        description: 'Testing with exact backend requirements - FormData format',
        productCode: 'BACKEND-TEST-' + Date.now()
      };
      
      const productResult = await this.createProduct(testProductData);
      if (!productResult.success) {
        throw new Error('Product creation failed: ' + productResult.error);
      }
      console.log('✅ Product created successfully:', productResult.data);
      
      // Step 5: Verify product appears in list
      console.log('🔍 Step 4: Verifying product persistence');
      const allProducts = await this.getAllProducts();
      if (!allProducts.success) {
        throw new Error('Failed to retrieve products: ' + allProducts.error);
      }
      
      const createdProduct = allProducts.data.find(p => p.name === testProductData.name);
      if (createdProduct) {
        console.log('✅ Product persistence confirmed!');
        console.log('📊 Total products in database:', allProducts.data.length);
        
        return {
          success: true,
          message: 'ALL BACKEND REQUIREMENTS PASSED!',
          data: {
            login: loginResult,
            category: category,
            product: createdProduct,
            totalProducts: allProducts.data.length
          }
        };
      } else {
        throw new Error('Product not found in database - persistence issue');
      }
      
    } catch (error) {
      console.error('❌ Backend requirements test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Get recycled products
  async getRecycledProducts() {
    try {
      console.log('🔄 Fetching recycled products...');
      
      const response = await fetch(`${API_BASE_URL}/products/recycled`, {
        method: 'GET',
        headers: createFormDataHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Recycled products fetched:', data);
      
      return {
        success: true,
        data: data.products || data.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching recycled products:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Restore product from recycle bin
  async restoreProduct(id) {
    try {
      console.log('♻️ Restoring product from recycle bin:', id);
      
      const response = await fetch(`${API_BASE_URL}/products/${id}/restore`, {
        method: 'PUT',
        headers: createFormDataHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product restored successfully:', data);
      
      return {
        success: true,
        data: data.product || data.data || data,
        message: data.message || 'Product restored successfully'
      };
    } catch (error) {
      console.error('❌ Error restoring product:', error);
      return { success: false, error: error.message };
    }
  },

  // Permanently delete product
  async permanentlyDeleteProduct(id) {
    try {
      console.log('🔥 Permanently deleting product:', id);
      
      const response = await fetch(`${API_BASE_URL}/products/${id}/permanent`, {
        method: 'DELETE',
        headers: createFormDataHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product permanently deleted:', data);
      
      return {
        success: true,
        message: data.message || 'Product permanently deleted'
      };
    } catch (error) {
      console.error('❌ Error permanently deleting product:', error);
      return { success: false, error: error.message };
    }
  }
};

export default productService;
