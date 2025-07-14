// Category Service - Ready for backend integration

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

export const categoryService = {
  // Get all categories
  async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
  },

  // Ensure default category exists (T-Shirts)
  async ensureDefaultCategory() {
    try {
      // First check if we have any categories
      const categoriesResult = await this.getAllCategories();
      
      if (categoriesResult.success && categoriesResult.data.length > 0) {
        // Look for T-shirt category specifically
        const tshirtCategory = categoriesResult.data.find(cat => 
          cat.name.toLowerCase().includes('shirt') || 
          cat.name.toLowerCase().includes('t-shirt') ||
          cat.name.toLowerCase() === 'clothing' ||
          cat.name.toLowerCase() === 'apparel'
        );
        
        if (tshirtCategory) {
          return { success: true, data: tshirtCategory };
        }
        
        // If no suitable category, return the first one
        return { success: true, data: categoriesResult.data[0] };
      }

      // If no categories exist, create default T-shirt category
      console.log('No categories found. Creating default T-shirt category...');
      const defaultCategory = {
        name: 'T-Shirts',
        description: 'High-quality t-shirts and apparel collection'
      };

      const result = await this.createCategory(defaultCategory);
      if (result.success) {
        console.log('✅ Created default T-shirt category successfully');
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error ensuring default category:', error);
      return { success: false, error: error.message };
    }
  },

  // Initialize categories for first time setup
  async initializeDefaultCategories() {
    try {
      const categoriesResult = await this.getAllCategories();
      
      if (categoriesResult.success && categoriesResult.data.length > 0) {
        console.log('Categories already exist, skipping initialization');
        return { success: true, data: categoriesResult.data };
      }

      console.log('Initializing default categories...');
      const defaultCategories = [
        {
          name: 'T-Shirts',
          description: 'High-quality t-shirts and casual wear'
        },
        {
          name: 'Hoodies',
          description: 'Comfortable hoodies and sweatshirts'
        },
        {
          name: 'Accessories',
          description: 'Fashion accessories and merchandise'
        }
      ];

      const createdCategories = [];
      for (const category of defaultCategories) {
        const result = await this.createCategory(category);
        if (result.success) {
          createdCategories.push(result.data);
          console.log(`✅ Created category: ${category.name}`);
        } else {
          console.error(`❌ Failed to create category ${category.name}:`, result.error);
        }
      }

      return { 
        success: true, 
        data: createdCategories,
        message: `Created ${createdCategories.length} default categories`
      };
    } catch (error) {
      console.error('Error initializing categories:', error);
      return { success: false, error: error.message };
    }
  }
};

export default categoryService;
