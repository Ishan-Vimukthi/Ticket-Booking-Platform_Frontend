import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import ImagePreview from './ImagePreview';
import LoadingSpinner from '../Loading/LoadingSpinner';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm'; // Import the EditProductForm
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
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const categoryMapRef = useRef<Record<string, string>>({});

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
    fetchCategories();
  }, []);

  useEffect(() => {
    products.forEach(product => {
      if (product.category && product.category._id && product.category.name) {
        categoryMapRef.current[product.category._id] = product.category.name;
      }
    });
  }, [products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/product/all-products');
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setProducts(data.data);

        data.data.forEach((product: Product) => {
          if (product.category && product.category._id && product.category.name) {
            categoryMapRef.current[product.category._id] = product.category.name;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/category/all-categories');
      const data = await response.json();
      if (data.status === "SUCCESS") {
        data.data.forEach((category: { _id: string; name: string }) => {
          categoryMapRef.current[category._id] = category.name;
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageClick = (images: string[]) => {
    setSelectedImages(images);
  };

  const handleAddProduct = (newProduct: Product) => {
    let categoryId = '';

    if (typeof newProduct.category === 'string') {
      categoryId = newProduct.category;
    } else if (newProduct.category && typeof newProduct.category === 'object') {
      categoryId = newProduct.category._id || '';
    }

    const validatedProduct = {
      ...newProduct,
      category: {
        _id: categoryId,
        name: categoryMapRef.current[categoryId] || 'Loading...'
      }
    };

    if (!categoryMapRef.current[categoryId] && categoryId) {
      fetchCategoryById(categoryId, validatedProduct._id);
    }

    setProducts(prev => [...prev, validatedProduct]);
  };

  const fetchCategoryById = async (categoryId: string, productId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/category/${categoryId}`);
      const data = await response.json();

      if (data.status === "SUCCESS" && data.data) {
        categoryMapRef.current[categoryId] = data.data.name;

        setProducts(prev => prev.map(p =>
          p._id === productId
            ? { ...p, category: { _id: categoryId, name: data.data.name } }
            : p
        ));
      }
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(product =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setProductToEdit(null);
  };

  const columns = [
    {
      header: '#',
      accessor: (item: Product, index: number) => index + 1
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Product Code', accessor: 'productCode' },
    {
      header: 'Category',
      accessor: (item: Product) => {
        if (item.category?.name) {
          return item.category.name;
        }

        const categoryId = typeof item.category === 'string'
          ? item.category
          : item.category?._id;

        return categoryId ? categoryMapRef.current[categoryId] || 'Loading...' : 'Unknown';
      }
    },
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
    setProductToEdit(product);
  };

  const handleDelete = (product: Product) => {
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
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/product/delete-product/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
        console.log('Product deleted successfully');
      } else {
        console.error('Failed to delete product:', data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
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

          {productToEdit && (
            <EditProductForm
              product={productToEdit}
              onClose={() => setProductToEdit(null)}
              onUpdate={handleUpdateProduct}
            />
          )}

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
