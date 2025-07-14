interface StockData {
  product: string;
  quantity: number;
  size: string;
  price: number;
  supplier: string;
}

export const fetchAllStocks = async (token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stock/all-stocks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
  
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        return data.data;
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  };
  
  export const addStock = async (stockData: StockData, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stock/add-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stockData)
      });
      const result = await response.json();
      if (result.status === "SUCCESS") {
        return result.data;
      } else {
        console.error('Failed to add stock:', result.message);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    }
    return null;
  };
  
  export const updateStock = async (stockId: string, updateData: Partial<StockData>, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stock/update-stock/${stockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === 'SUCCESS') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };
  
  export const deleteStock = async (stockId: string, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stock/delete-stock/${stockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete stock');
      }
  
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        return data.data;
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
  };