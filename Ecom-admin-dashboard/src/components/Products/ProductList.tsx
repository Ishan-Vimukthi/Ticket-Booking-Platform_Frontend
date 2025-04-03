import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import ImagePreview from './ImagePreview';
import LoadingSpinner from '../Loading/LoadingSpinner';
import AddProductForm from './AddProductForm';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';

interface Product {
  _id: string;
  name: string;
  productCode: string;
  category: {
    _id: string;
    name: string;
  };
  size: string;
  color: string;
  price: number;
  images: string[];
}

interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  itemToDelete?: Product;
  onConfirm: () => void;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/product/all-products');
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (images: string[]) => {
    setSelectedImages(images);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const columns = [
    { header: '#', accessor: (item: Product) => item._id },
    { header: 'Name', accessor: 'name' },
    { header: 'Product Code', accessor: 'productCode' },
    { header: 'Category', accessor: (item: Product) => item.category.name },
    { header: 'Size', accessor: 'size' },
    { header: 'Color', accessor: 'color' },
    { header: 'Price', accessor: (item: Product) => `$${item.price}` },
    {
      header: 'Image',
      accessor: (item: Product) => (
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
          onClick={() => handleImageClick(item.images)}
        />
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    console.log('Edit product:', product);
  };

  const handleDelete = (product: Product) => {
    // Show confirmation modal before deleting
    setConfirmation({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete product "${product.name}" (${product.productCode})? This action can be reversed later.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      itemToDelete: product,
      onConfirm: () => performSoftDelete(product)
    });
  };

  const performSoftDelete = async (product: Product) => {
    try {
      // Get token from localStorage or your auth state
      const token = localStorage.getItem('token'); // Adjust based on how you store tokens
      
      const response = await fetch(`http://localhost:3000/product/delete-product/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === "SUCCESS") {
        // Remove the product from the UI state
        setProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
        
        // Show success message (you can add a toast notification here)
        console.log('Product deleted successfully');
      } else {
        // Show error message
        console.error('Failed to delete product:', data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      // Close the confirmation modal
      closeConfirmationModal();
    }
  };

  const closeConfirmationModal = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="p-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-end space-x-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </motion.button>
          </div>

          <DataTable
            columns={columns}
            data={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {selectedImages && (
            <ImagePreview
              images={selectedImages}
              onClose={() => setSelectedImages(null)}
            />
          )}

          {showAddForm && (
            <AddProductForm
              onClose={() => setShowAddForm(false)}
              onSubmit={handleAddProduct}
            />
          )}

          {/* Reusable Confirmation Modal */}
          <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            confirmButtonText={confirmation.confirmButtonText}
            cancelButtonText={confirmation.cancelButtonText}
            onConfirm={confirmation.onConfirm}
            onCancel={closeConfirmationModal}
          />
        </>
      )}
    </div>
  );
};

export default ProductList;