export const addCategory = async (name: string, description: string, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/add-category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add category');
    }

    const data = await response.json();
    if (data.status === "SUCCESS") {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to add category');
    }
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const fetchCategories = async (token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/all-categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.status === "SUCCESS") {
      return data.data;
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
  return [];
};

export const fetchCategoryById = async (categoryId: string, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.status === "SUCCESS" && data.data) {
      return data.data.name;
    }
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
  }
  return null;
};

export const updateCategory = async (categoryId: string, name: string, description: string, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/update-category/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update category');
    }

    const data = await response.json();
    if (data.status === "SUCCESS") {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to update category');
    }
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/delete-category/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.status === "SUCCESS") {
      return true;
    } else {
      console.error('Failed to delete category:', data.message);
    }
  } catch (error) {
    console.error('Error deleting category:', error);
  }
  return false;
};