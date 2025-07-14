import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Info } from 'lucide-react';
import LoadingSpinner from '../Loading/LoadingSpinner';
import Select from 'react-select';
import {  updateStock } from '../../services/stockService';
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

// Type guard to check if product is a Product object or just an ID
const isProductObject = (product: Product | string): product is Product => {
  return typeof product !== 'string' && product !== null && typeof product === 'object';
};

interface EditStockFormProps {
  stock: Stock;
  onClose: () => void;
  onUpdate: (updatedStock: Stock) => void;
  productCache?: Record<string, Product>;
}

const EditStockForm: React.FC<EditStockFormProps> = ({
  stock,
  onClose,
  onUpdate,
  productCache = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize form data from the provided stock
  const [formData, setFormData] = useState({
    quantity: stock.quantity,
    price: stock.price / 100, // Convert from cents to dollars for display
    size: stock.size,
    supplier: stock.supplier,
    product: isProductObject(stock.product) ? stock.product._id : stock.product,
    batchNumber: stock.batchNumber
  });

  // Store the initial state to compare against
  const initialFormData = useRef({
    quantity: stock.quantity,
    price: stock.price / 100,
    size: stock.size,
    supplier: stock.supplier,
    product: isProductObject(stock.product) ? stock.product._id : stock.product,
    batchNumber: stock.batchNumber
  });

  const token = localStorage.getItem('token');

  // Function to check if form data has changed
  const hasFormChanged = () => {
    return (
      formData.quantity !== initialFormData.current.quantity ||
      formData.price !== initialFormData.current.price ||
      formData.size !== initialFormData.current.size ||
      formData.supplier !== initialFormData.current.supplier
    );
  };

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

    // Clear previous messages
    setErrorMessage('');
    setInfoMessage('');

    // Check if form data has changed
    if (!hasFormChanged()) {
      setInfoMessage('No changes detected. Update skipped.');
      return;
    }

    setIsLoading(true);

    try {
      // Convert price to cents for storage
      const priceInCents = Math.round(formData.price * 100);

      // Create update data object - only include fields that can be updated
      const updateData = {
        quantity: formData.quantity,
        price: priceInCents,
        size: formData.size,
        supplier: formData.supplier,
        // Add current date as last restocked if quantity changed
        ...(formData.quantity !== stock.quantity && { lastRestocked: new Date().toISOString() })
      };

      await updateStock(stock._id, updateData, token);

      // Find the product in our cache or products array
      const productData = isProductObject(stock.product)
        ? stock.product
        : (productCache[formData.product] || products.find(p => p._id === formData.product));

      // Create updated stock object with all properties
      const updatedStock: Stock = {
        ...stock,
        ...updateData,
        price: priceInCents, // Use the cents value
        product: productData || stock.product,
        // Keep other properties that weren't updated
        _id: stock._id,
        batchNumber: stock.batchNumber,
        createdAt: stock.createdAt,
        lastRestocked: updateData.lastRestocked || stock.lastRestocked,
      };

      onUpdate(updatedStock);
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while updating the stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    // Clear info message when user starts making changes
    if (infoMessage) {
      setInfoMessage('');
    }
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
            <h2 className="text-2xl font-bold text-gray-800">Edit Stock</h2>
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

          {infoMessage && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg flex items-center">
              <Info size={20} className="mr-2" />
              <span>{infoMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <Select
                name="product"
                value={productOptions.find(option => option.value === formData.product)}
                options={productOptions}
                className="w-full"
                isDisabled={true} // Disable product selection in edit mode
                aria-label="Product selection"
              />
              <p className="mt-1 text-sm text-gray-500">Product cannot be changed. Create a new stock entry instead.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
                title="Batch number cannot be edited"
              />
              <p className="mt-1 text-sm text-gray-500">Batch number cannot be changed</p>
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
                step="0.01"
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
              className={`px-4 py-2 flex items-center space-x-2 ${hasFormChanged() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} text-white rounded-lg`}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Updating...' : 'Update Stock'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditStockForm;
