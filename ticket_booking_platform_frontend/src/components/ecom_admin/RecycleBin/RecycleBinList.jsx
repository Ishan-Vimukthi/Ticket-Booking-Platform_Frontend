import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, RotateCcw, X, AlertCircle, Package } from 'lucide-react';
import { productService } from '../../../services/ecom_admin/productService';

const RecycleBinList = () => {
  const [deletedItems, setDeletedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isRestoring, setIsRestoring] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const loadDeletedItems = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🗑️ Loading deleted products from recycle bin...');
      
      const result = await productService.getRecycledProducts();
      
      if (result.success) {
        const products = result.data || [];
        console.log('✅ Deleted products loaded:', products.length, 'items');
        
        // Transform products to recycled items format for display
        const transformedItems = products.map(product => ({
          _id: product._id,
          name: product.name,
          type: 'product',
          productCode: product.productCode || 'N/A',
          description: product.description || 'No description',
          price: product.price || 0,
          quantity: product.quantity || 0,
          deletedDate: product.deletedAt ? new Date(product.deletedAt).toISOString().split('T')[0] : 'Unknown',
          deletedBy: 'Admin', // Backend doesn't provide this info
          originalData: product // Keep original product data for restore
        }));
        
        setDeletedItems(transformedItems);
      } else {
        throw new Error(result.error || 'Failed to load deleted items');
      }
      
    } catch (err) {
      console.error('❌ Error loading deleted items:', err);
      setError(err.message || 'Failed to load deleted items');
      setDeletedItems([]); // Clear items on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const filteredItems = deletedItems.filter(item => {
    if (!item) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(searchLower) ||
      (item.type || '').toLowerCase().includes(searchLower) ||
      (item.productCode || '').toLowerCase().includes(searchLower)
    );
  });

  // Debug logging
  console.log('🔍 RecycleBin Debug:');
  console.log('- deletedItems array:', deletedItems);
  console.log('- deletedItems length:', deletedItems.length);
  console.log('- filteredItems length:', filteredItems.length);

  const handleRestore = async (item) => {
    if (isRestoring) return; // Prevent multiple simultaneous restores
    
    try {
      setIsRestoring(item._id);
      console.log('♻️ Restoring product:', item.name);
      
      const result = await productService.restoreProduct(item._id);
      
      if (result.success) {
        // Remove from deleted items list
        setDeletedItems(prev => prev.filter(i => i._id !== item._id));
        console.log('✅ Product restored successfully:', item.name);
        alert(`✅ "${item.name}" has been restored successfully!`);
      } else {
        throw new Error(result.error || 'Failed to restore product');
      }
      
    } catch (err) {
      console.error('❌ Error restoring product:', err);
      alert(`❌ Failed to restore "${item.name}": ${err.message}`);
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async (item) => {
    if (isDeleting) return; // Prevent multiple simultaneous deletes
    
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to PERMANENTLY delete "${item.name}"?\n\n` +
      `This action CANNOT be undone and will remove the product completely from the system.`
    );
    
    if (!confirmed) return;
    
    try {
      setIsDeleting(item._id);
      console.log('🗑️ Permanently deleting product:', item.name);
      
      const result = await productService.permanentlyDeleteProduct(item._id);
      
      if (result.success) {
        // Remove from deleted items list
        setDeletedItems(prev => prev.filter(i => i._id !== item._id));
        console.log('✅ Product permanently deleted:', item.name);
        alert(`✅ "${item.name}" has been permanently deleted.`);
      } else {
        throw new Error(result.error || 'Failed to permanently delete product');
      }
      
    } catch (err) {
      console.error('❌ Error permanently deleting product:', err);
      alert(`❌ Failed to permanently delete "${item.name}": ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recycle Bin</h1>
        <div className="text-sm text-gray-500">
          Items are automatically deleted after 30 days
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Deleted Items Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading deleted items...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error loading deleted items</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={loadDeletedItems}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <motion.tr
                key={item._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        src={item.image || '/images/products/default.jpg'} 
                        alt={item.name} 
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Product
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Admin
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRestore(item._id)}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                    >
                      <RotateCcw size={16} />
                      Restore
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(item._id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                    >
                      <X size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Recycle bin is empty</p>
        </div>
      )}
    </div>
  );
};

export default RecycleBinList;
