import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertTriangle, Eye } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ProductDetailModal from './ProductDetailModal';
import AddStockForm from './AddStockForm';
import EditStockForm from './EditStockForm';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';
import { debounce } from 'lodash';
import { fetchProductById, fetchProducts } from '../../services/productService';
import { fetchAllStocks, deleteStock } from '../../services/stockService';

interface Product {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  category: {
    _id: string;
    name: string;
  } | string;
  images: string[];
}

interface Stock {
  _id: string;
  product: Product | string;
  batchNumber: string;
  quantity: number;
  size: string;
  price: number;
  lowStockAlert: number;
  lastRestocked: string;
  supplier: string;
  createdAt: string;
}

// Type guard to check if product is a Product object or just an ID
const isProductObject = (product: Product | string): product is Product => {
  return typeof product !== 'string' && product !== null && typeof product === 'object';
};

interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  itemToDelete?: Stock;
  onConfirm: () => void;
}

const StockList = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockToEdit, setStockToEdit] = useState<Stock | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add product cache
  const [productCache, setProductCache] = useState<Record<string, Product>>({});

  const [confirmation, setConfirmation] = useState<ConfirmationConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    onConfirm: () => {}
  });

  const token = localStorage.getItem('token');

  // Function to fetch a single product by ID
  const fetchProductByIdWrapper = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      return await fetchProductById(productId, token);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }, [token]);

  // Function to load all products and update the cache
  const fetchAllProductsWrapper = useCallback(async () => {
    try {
      const products = await fetchProducts(token);
      const newCache: Record<string, Product> = {};
      products.forEach((product: Product) => {
        newCache[product._id] = product;
      });
      setProductCache(newCache);
      return newCache;
    } catch (error) {
      console.error('Error fetching products:', error);
      return null;
    }
  }, [token]);

  // Process stocks to ensure product data is loaded
  const processStocks = useCallback(async (stocksData: Stock[], cache: Record<string, Product>) => {
    const processedStocks = await Promise.all(
      stocksData.map(async (stock) => {
        // If product is just an ID string
        if (typeof stock.product === 'string') {
          const productId = stock.product;
          // Check cache first
          if (cache[productId]) {
            return { ...stock, product: cache[productId] };
          } else {
            // Fetch if not in cache
            const product = await fetchProductByIdWrapper(productId);
            if (product) {
              // Update cache
              setProductCache(prev => ({ ...prev, [productId]: product }));
              return { ...stock, product };
            }
          }
        }
        return stock;
      })
    );

    return processedStocks;
  }, [fetchProductByIdWrapper]);

  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, fetch and cache all products
        const productCacheData = await fetchAllProductsWrapper();

        // Then fetch stocks
        const stocksData = await fetchAllStocks(token);

        if (stocksData) {
          // Process stocks to ensure product data
          const processedStocks = await processStocks(stocksData, productCacheData || {});
          setStocks(processedStocks);
          setFilteredStocks(processedStocks);
        } else {
          throw new Error('Unknown error occurred');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, [token, fetchAllProductsWrapper, processStocks]);

  const handleProductView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleEdit = (stock: Stock) => {
    setStockToEdit(stock);
  };

  const handleDelete = (stock: Stock) => {
    setConfirmation({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete stock for "${isProductObject(stock.product) ? stock.product.name : 'Unknown Product'}" (${stock.batchNumber})? This action can be reversed later.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      itemToDelete: stock,
      onConfirm: () => performDelete(stock)
    });
  };

  const performDelete = async (stock: Stock) => {
    try {
      await deleteStock(stock._id, token);
      setStocks(prev => prev.filter(s => s._id !== stock._id));
      setFilteredStocks(prev => prev.filter(s => s._id !== stock._id));
      console.log('Stock deleted successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      closeConfirmationModal();
    }
  };

  const closeConfirmationModal = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const handleSearch = debounce((query: string) => {
    setFilteredStocks(
      stocks.filter(stock => {
        const productName = isProductObject(stock.product) ? stock.product.name.toLowerCase() : '';
        const productCode = isProductObject(stock.product) ? stock.product.productCode.toLowerCase() : '';

        return productName.includes(query.toLowerCase()) ||
          productCode.includes(query.toLowerCase()) ||
          stock.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
          stock.supplier.toLowerCase().includes(query.toLowerCase());
      })
    );
  }, 300);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleAddStock = async (newStock: Stock) => {
    // If the new stock has just a product ID, fetch the full product data
    if (typeof newStock.product === 'string') {
      const productId = newStock.product;

      // Try to get from cache first
      let productData = productCache[productId];

      // If not in cache, fetch it
      if (!productData) {
        productData = (await fetchProductByIdWrapper(productId)) as Product;

        // Update cache with the new product
        if (productData) {
          setProductCache(prev => ({
            ...prev,
            [productId]: productData
          }));
        }
      }

      // Update the stock with the full product data
      if (productData) {
        newStock = {
          ...newStock,
          product: productData
        };
      }
    }

    setStocks(prev => [...prev, newStock]);
    setFilteredStocks(prev => [...prev, newStock]);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: '#',
      accessor: (_item: Stock, index: number) => index + 1
    },
    { header: 'Batch Number', accessor: (item: Stock) => item.batchNumber },
    {
      header: 'Product',
      accessor: (item: Stock) => (
        <div className="flex items-center">
          {isProductObject(item.product) ? item.product.name : 'Loading...'}
          {isProductObject(item.product) && (
            <button
              title="View product details"
              onClick={(e) => {
                e.stopPropagation();
                handleProductView(item.product as Product);
              }}
              className="ml-2 text-indigo-600 hover:text-indigo-800"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      )
    },
    { header: 'Size', accessor: (item: Stock) => item.size },
    {
      header: 'Quantity',
      accessor: (item: Stock) => (
        <span className={item.quantity <= item.lowStockAlert ? 'text-red-600 font-medium' : ''}>
          {item.quantity}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: (item: Stock) => (
        <span>
          ${(item.price / 100).toFixed(2)}
        </span>
      )
    },
    { header: 'Supplier', accessor: (item: Stock) => item.supplier },
    {
      header: 'Last Restocked',
      accessor: (item: Stock) => item.lastRestocked ? formatDate(item.lastRestocked) : 'N/A'
    }
  ];

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
                placeholder="Search stocks..."
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
              <span>Add Stock</span>
            </motion.button>
          </div>

          {!error && filteredStocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No stocks found. Add a new stock to get started.</p>
            </div>
          ) : !error ? (
            <DataTable
              columns={columns}
              data={filteredStocks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}

          <AnimatePresence>
            {selectedProduct && (
              <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stockToEdit && (
              <EditStockForm
                stock={stockToEdit}
                onClose={() => setStockToEdit(null)}
                onUpdate={(updatedStock) => {
                  setStocks(prev => prev.map(s => s._id === updatedStock._id ? updatedStock : s));
                  setFilteredStocks(prev => prev.map(s => s._id === updatedStock._id ? updatedStock : s));
                  setStockToEdit(null);
                }}
                productCache={productCache}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAddForm && (
              <AddStockForm
                onClose={() => setShowAddForm(false)}
                onSubmit={handleAddStock}
                productCache={productCache}
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

export default StockList;
