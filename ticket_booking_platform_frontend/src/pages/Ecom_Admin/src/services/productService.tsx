export const fetchProducts = async (token: string | null) => {
try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/all-products`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
    });
    const data = await response.json();
    if (data.status === "SUCCESS") {
    return data.data;
    }
} catch (error) {
    console.error('Error fetching products:', error);
}
return [];
};

export const fetchProductById = async (productId: string, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    if (data.status === 'SUCCESS') {
      return data.data;
    } else {
      throw new Error(data.message || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const addProduct = async (productData: FormData, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/add-product`, {
        method: 'POST',
        body: productData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === "SUCCESS") {
        return result.data;
      } else {
        console.error('Failed to add product:', result.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
    return null;
  };

  export const updateProduct = async (productId: string, productData: FormData, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/update-product/${productId}`, {
        method: 'PUT',
        body: productData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === "SUCCESS") {
        return result.data;
      } else {
        console.error('Failed to update product:', result.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    return null;
  };

export const deleteProduct = async (productId: string, token: string | null) => {
try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/delete-product/${productId}`, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`
    }
    });
    const data = await response.json();
    if (data.status === "SUCCESS") {
    return true;
    } else {
    console.error('Failed to delete product:', data.message);
    }
} catch (error) {
    console.error('Error deleting product:', error);
}
return false;
};