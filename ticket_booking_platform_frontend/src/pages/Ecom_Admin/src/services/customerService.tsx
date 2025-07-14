export const fetchCustomers = async (token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/all-customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
  
      const data = await response.json();
      if (data.status === "SUCCESS") {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };
  
  export const deleteCustomer = async (customerId: string, token: string | null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/delete-customer/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
  
      const data = await response.json();
      if (data.status === "SUCCESS") {
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };
  