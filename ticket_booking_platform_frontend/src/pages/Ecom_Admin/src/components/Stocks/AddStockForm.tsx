import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../Loading/LoadingSpinner';
import Select from 'react-select';
import { addStock } from '../../services/stockService';
import { fetchProducts } from '../../services/productService';

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

interface StockData {
  product: string;
  quantity: number;
  size: string;
  price: number;
  supplier: string;
}

interface AddStockFormProps {
  onClose: () => void;
  onSubmit?: (stock: Stock) => void;
  productCache?: Record<string, Product>; // Add product cache prop
}

const AddStockForm: React.FC<AddStockFormProps> = ({ onClose, onSubmit, productCache = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<StockData>({
    product: '',
    quantity: 0,
    size: '',
    price: 0,
    supplier: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // First try to use the cached products
        if (Object.keys(productCache).length > 0) {
          const productsArray = Object.values(productCache);
          setProducts(productsArray);
          setIsLoading(false);
          return;
        }

        // Otherwise fetch products from API
        const data = await fetchProducts(token);
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        setErrorMessage('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    // Handle outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [token, onClose, productCache]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Convert price to cents for storage (assuming this is the API expectation)
      const priceInCents = Math.round(formData.price * 100);

      const stockData: StockData = {
        ...formData,
        price: priceInCents
      };

      const result = await addStock(stockData, token);

      if (result) {
        if (onSubmit) {
          // Find the product in our products array or cache
          const selectedProduct = productCache[formData.product] ||
                                  products.find(p => p._id === formData.product);

          // If product data is available, add it to the stock data that's passed back
          const enrichedStockData = {
            ...result,
            product: selectedProduct || result.product
          };

          onSubmit(enrichedStockData);
        }
        onClose();
      } else {
        setErrorMessage('Failed to add stock. Please try again.');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      setErrorMessage('An error occurred while adding the stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle numeric inputs
    if (name === 'quantity' || name === 'price') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  interface ProductOption {
    value: string;
    label: JSX.Element;
  }

  const handleProductChange = (selectedOption: ProductOption | null) => {
    setFormData(prev => ({
      ...prev,
      product: selectedOption?.value || ''
    }));
  };

  const productOptions = products.map(product => ({
    value: product._id,
    label: (
      <div className="flex items-center">
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-6 h-6 mr-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <span>{product.name} ({product.productCode})</span>
      </div>
    ),
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {isLoading && <LoadingSpinner />}

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Add New Stock</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product*
              </label>
              <Select
                name="product"
                value={productOptions.find(option => option.value === formData.product)}
                onChange={handleProductChange}
                options={productOptions}
                className="w-full"
                required
                aria-label="Product selection"
                isDisabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size*
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                title="Select size"
              >
                <option value="">Select size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity*
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                title="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (in $)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                title="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier*
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter supplier name"
                title="Enter supplier name"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Stock'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddStockForm;