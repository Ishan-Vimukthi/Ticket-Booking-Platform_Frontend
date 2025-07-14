import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import ImagePreview from './ImagePreview';
import LoadingSpinner from '../Loading/LoadingSpinner';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';
import { fetchProducts, deleteProduct } from '../../services/productService';
import { fetchCategories, fetchCategoryById } from '../../services/categoryService';
import { debounce } from 'lodash';

interface Product {
  _id: string;
  name: string;
  productCode: string;
  category: {
    _id: string;
    name: string;
  };
  description: string;
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryMapRef = useRef<Record<string, string>>({});

  const [confirmation, setConfirmation] = useState<ConfirmationConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    onConfirm: () => {}
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const productsData = await fetchProducts(token);
        const categoriesData = await fetchCategories(token);

        setProducts(productsData);
        setFilteredProducts(productsData);

        productsData.forEach((product: Product) => {
          if (product.category && product.category._id && product.category.name) {
            categoryMapRef.current[product.category._id] = product.category.name;
          }
        });

        categoriesData.forEach((category: { _id: string; name: string }) => {
          categoryMapRef.current[category._id] = category.name;
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    products.forEach(product => {
      if (product.category && product.category._id && product.category.name) {
        categoryMapRef.current[product.category._id] = product.category.name;
      }
    });
  }, [products]);

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
      fetchCategoryById(categoryId, token).then(name => {
        if (name) {
          categoryMapRef.current[categoryId] = name;
          setProducts(prev => prev.map(p =>
            p._id === validatedProduct._id
              ? { ...p, category: { _id: categoryId, name } }
              : p
          ));
          setFilteredProducts(prev => prev.map(p =>
            p._id === validatedProduct._id
              ? { ...p, category: { _id: categoryId, name } }
              : p
          ));
        }
      }).catch(err => {
        setError(err.message);
      });
    }

    setProducts(prev => [...prev, validatedProduct]);
    setFilteredProducts(prev => [...prev, validatedProduct]);
    setShowAddForm(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(product =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setFilteredProducts(prev =>
      prev.map(product =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setProductToEdit(null);
  };

  const columns = [
    {
      header: '#',
      accessor: (_item: Product, index: number) => index + 1
    },
    { header: 'Name', accessor: (item: Product) => item.name },
    { header: 'Product Code', accessor: (item: Product) => item.productCode },
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
    { header: 'Description', accessor: (item: Product) => item.description },
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
      const success = await deleteProduct(product._id, token);
      if (success) {
        setProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
        setFilteredProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
        console.log('Product deleted successfully');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      closeConfirmationModal();
    }
  };

  const closeConfirmationModal = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.productCode.toLowerCase().includes(query.toLowerCase()) ||
          (product.category?.name || '').toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
        )
      );
    }, 300),
    [products]
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className="p-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 flex items-center justify-end space-x-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
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

          {!error && filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found. Add a new product to get started.</p>
            </div>
          ) : !error ? (
            <DataTable
              columns={columns}
              data={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}

          <AnimatePresence>
            {selectedImages && (
              <ImagePreview
                images={selectedImages}
                onClose={() => setSelectedImages(null)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAddForm && (
              <AddProductForm
                onClose={() => setShowAddForm(false)}
                onSubmit={handleAddProduct}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {productToEdit && (
              <EditProductForm
                product={productToEdit}
                onClose={() => setProductToEdit(null)}
                onUpdate={handleUpdateProduct}
              />
            )}
          </AnimatePresence>

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