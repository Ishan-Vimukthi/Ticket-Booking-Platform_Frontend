import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import AddProductForm from './AddProductForm';
import { productService } from '../../../services/ecom_admin/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Loading products from backend...');
        const result = await productService.getAllProducts();
        
        if (result.success) {
          console.log('✅ Products loaded:', result.data);
          setProducts(result.data || []);
        } else {
          console.error('❌ Failed to load products:', result.error);
          // Fallback to empty array if backend fails
          setProducts([]);
        }
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = async (productData) => {
    try {
      console.log('🚀 Adding product:', productData);
      
      const result = await productService.createProduct(productData);
      
      if (result.success) {
        console.log('✅ Product added successfully:', result.data);
        
        // Refresh the products list
        const refreshResult = await productService.getAllProducts();
        if (refreshResult.success) {
          setProducts(refreshResult.data || []);
        }
        
        setShowAddForm(false);
        alert(`✅ ${result.message || 'Product added successfully!'}`);
      } else {
        console.error('❌ Failed to add product:', result.error);
        alert(`❌ Failed to add product: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error adding product:', error);
      alert(`❌ Error adding product: ${error.message}`);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      console.log('✏️ Updating product:', editingProduct._id, productData);
      
      const result = await productService.updateProduct(editingProduct._id, productData);
      
      if (result.success) {
        console.log('✅ Product updated successfully:', result.data);
        
        // Refresh the products list
        const refreshResult = await productService.getAllProducts();
        if (refreshResult.success) {
          setProducts(refreshResult.data || []);
        }
        
        setEditingProduct(null);
        alert(`✅ Product updated successfully!`);
      } else {
        console.error('❌ Failed to update product:', result.error);
        alert(`❌ Failed to update product: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      alert(`❌ Error updating product: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      console.log('🗑️ Deleting product:', productId);
      
      const result = await productService.deleteProduct(productId);
      
      if (result.success) {
        console.log('✅ Product moved to recycle bin successfully');
        
        // Refresh the products list
        const refreshResult = await productService.getAllProducts();
        if (refreshResult.success) {
          setProducts(refreshResult.data || []);
        }
        
        setShowDeleteConfirm(null);
        alert(`✅ Product moved to recycle bin successfully!`);
      } else {
        console.error('❌ Failed to delete product:', result.error);
        alert(`❌ Failed to delete product: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      alert(`❌ Error deleting product: ${error.message}`);
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
        <h1 className="text-2xl font-bold">Products Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add Product
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={48} className="text-gray-400" />
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">SKU: {product.productCode || product.sku || 'N/A'}</p>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="mb-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-gray-600">Sizes:</span>
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map(size => (
                      <span key={size} className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No sizes specified</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-600">Colors:</span>
                  {product.colors && product.colors.length > 0 ? (
                    product.colors.map(color => (
                      <span key={color} className="text-xs bg-green-100 px-2 py-1 rounded">
                        {color}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No colors specified</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                <span className="text-sm text-gray-600">Stock: {product.quantity}</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(product)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddProduct}
        />
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <AddProductForm
          isEdit={true}
          initialData={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleEditProduct}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-600">This action will move the product to recycle bin</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900">{showDeleteConfirm.name}</h4>
              <p className="text-sm text-gray-600">SKU: {showDeleteConfirm.sku}</p>
              <p className="text-sm text-gray-600">Price: ${showDeleteConfirm.price}</p>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this product? It will be moved to the recycle bin and can be recovered later if needed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteConfirm._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Move to Recycle Bin
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
