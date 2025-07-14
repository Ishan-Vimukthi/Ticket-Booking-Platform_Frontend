export const fetchOrders = async (token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/all-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
  
      const result = await response.json();
      if (result.status === 'SUCCESS') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };
  
  export const updateOrderStatus = async (orderId: string, newStatus: string, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/update-order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
  
      const result = await response.json();
      if (result.status === 'SUCCESS') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };
  
  export const deleteOrder = async (orderId: string, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/delete-order/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
  
      const result = await response.json();
      if (result.status === 'SUCCESS') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };
  