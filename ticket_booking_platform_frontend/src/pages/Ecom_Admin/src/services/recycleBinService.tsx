const BASE_URL = import.meta.env.VITE_API_URL;
export interface DeletedItem {
  _id: string;
  name?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  // Order fields
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  totalAmount?: number;
  status?: string;
  items?: Record<string, unknown>[];
  product?: {
    name?: string;
    productCode?: string;
    description?: string;
  };
  batchNumber?: string;
  quantity?: number;
  price?: number;
  supplier?: string;
  deletedAt: number;
  createdAt: string;
}

export type ItemType = 'Categories' | 'Products' | 'Customers' | 'Orders' | 'Stocks';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

class RecycleBinApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private getEndpoint(type: ItemType, action: 'fetch' | 'restore' | 'permanentDelete'): string {
    const endpoints = {
      Categories: {
        fetch: 'categories/all-categories/with-deleted',
        restore: 'categories/restore-category',
        permanentDelete: 'categories/permanently-delete-category'
      },
      Products: {
        fetch: 'products/all-products/with-deleted',
        restore: 'products/restore-product',
        permanentDelete: 'products/permanently-delete-product'
      },
      Customers: {
        fetch: 'customers/all-customers/with-deleted',
        restore: 'customers/restore-customer',
        permanentDelete: 'customers/permanently-delete-customer'
      },
      Orders: {
        fetch: 'orders/all-orders/with-deleted',
        restore: 'orders/restore-order',
        permanentDelete: 'orders/permanently-delete-order'
      },
      Stocks: {
        fetch: 'stock/all-stocks/with-deleted',
        restore: 'stock/restore-stock',
        permanentDelete: 'stock/permanent-delete-stock'
      }
    };

    const typeEndpoints = endpoints[type];
    if (!typeEndpoints) {
      throw new Error(`Invalid item type: ${type}`);
    }

    return typeEndpoints[action];
  }

  async fetchDeletedItems(type: ItemType): Promise<DeletedItem[]> {
    try {
      const endpoint = this.getEndpoint(type, 'fetch');
      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DeletedItem[]> = await response.json();
      
      if (result.status !== 'SUCCESS') {
        throw new Error(result.message || 'Failed to fetch items');
      }

      // Filter to show only deleted items (deletedAt > 0)
      return result.data.filter(item => item.deletedAt > 0);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `Failed to fetch deleted ${type.toLowerCase()}: ${error.message}`
          : `Failed to fetch deleted ${type.toLowerCase()}: Unknown error`
      );
    }
  }

  async restoreItem(type: ItemType, itemId: string): Promise<void> {
    try {
      const endpoint = this.getEndpoint(type, 'restore');
      const response = await fetch(`${BASE_URL}/${endpoint}/${itemId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DeletedItem> = await response.json();
      
      if (result.status !== 'SUCCESS') {
        throw new Error(result.message || 'Failed to restore item');
      }
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `Failed to restore ${type.toLowerCase().slice(0, -1)}: ${error.message}`
          : `Failed to restore ${type.toLowerCase().slice(0, -1)}: Unknown error`
      );
    }
  }

  async permanentlyDeleteItem(type: ItemType, itemId: string): Promise<void> {
    try {
      const endpoint = this.getEndpoint(type, 'permanentDelete');
      const response = await fetch(`${BASE_URL}/${endpoint}/${itemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DeletedItem> = await response.json();
      
      if (result.status !== 'SUCCESS') {
        throw new Error(result.message || 'Failed to permanently delete item');
      }
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `Failed to permanently delete ${type.toLowerCase().slice(0, -1)}: ${error.message}`
          : `Failed to permanently delete ${type.toLowerCase().slice(0, -1)}: Unknown error`
      );
    }
  }

  // Bulk operations
  async restoreMultipleItems(type: ItemType, itemIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };
    
    for (const itemId of itemIds) {
      try {
        await this.restoreItem(type, itemId);
        results.success.push(itemId);
      } catch (error) {
        results.failed.push(itemId);
        console.error(`Failed to restore item ${itemId}:`, error);
      }
    }
    
    return results;
  }

  async permanentlyDeleteMultipleItems(type: ItemType, itemIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };
    
    for (const itemId of itemIds) {
      try {
        await this.permanentlyDeleteItem(type, itemId);
        results.success.push(itemId);
      } catch (error) {
        results.failed.push(itemId);
        console.error(`Failed to permanently delete item ${itemId}:`, error);
      }
    }
    
    return results;
  }
}

// Create and export a singleton instance
export const recycleBinApi = new RecycleBinApiService();

// Export utility functions for common operations
export const getItemName = (item: DeletedItem): string => {
  // For regular name field
  if (item.name) return item.name;
  
  // For customers
  if (item.firstName || item.lastName) {
    return `${item.firstName || ''} ${item.lastName || ''}`.trim();
  }
  
  // For orders (customer name)
  if (item.customer?.firstName || item.customer?.lastName) {
    return `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim();
  }
  
  // For stocks (product name)
  if (item.product?.name) {
    return item.product.name;
  }
  
  return 'N/A';
};

export const getItemDescription = (item: DeletedItem, type: ItemType): string => {
  switch (type) {
    case 'Categories':
      return item.description || 'No description';
    case 'Products':
      return `${item.product?.productCode || 'N/A'} - ${item.description || 'No description'}`;
    case 'Customers':
      return `${item.email || 'No email'} - ${item.phone || 'No phone'}`;
    case 'Orders':
      return `Total: $${item.totalAmount || 0} - Status: ${item.status || 'Unknown'}`;
    case 'Stocks':
      return `Batch: ${item.batchNumber || 'N/A'} - Qty: ${item.quantity || 0} - Supplier: ${item.supplier || 'N/A'}`;
    default:
      return item.description || 'No description';
  }
};

export const searchItems = (items: DeletedItem[], searchQuery: string): DeletedItem[] => {
  if (!searchQuery) return items;

  return items.filter(item => {
    const name = getItemName(item);
    const description = item.description || '';
    const email = item.email || item.customer?.email || '';
    const phone = item.phone || '';
    const address = item.address || '';
    const city = item.city || '';
    const status = item.status || '';
    const supplier = item.supplier || '';
    const batchNumber = item.batchNumber || '';
    const productCode = item.product?.productCode || '';
    
    const searchTerm = searchQuery.toLowerCase();
    
    return name.toLowerCase().includes(searchTerm) ||
           description.toLowerCase().includes(searchTerm) ||
           email.toLowerCase().includes(searchTerm) ||
           phone.toLowerCase().includes(searchTerm) ||
           address.toLowerCase().includes(searchTerm) ||
           city.toLowerCase().includes(searchTerm) ||
           status.toLowerCase().includes(searchTerm) ||
           supplier.toLowerCase().includes(searchTerm) ||
           batchNumber.toLowerCase().includes(searchTerm) ||
           productCode.toLowerCase().includes(searchTerm);
  });
};

export const formatDeletedDate = (deletedAt: number): string => {
  return new Date(deletedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
