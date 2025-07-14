import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Info, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../Loading/LoadingSpinner';
import { updateProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';

interface Category {
  _id: string;
  name: string;
  description: string;
}

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

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
  onUpdate: (updatedProduct: Product) => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: product.name,
    productCode: product.productCode,
    description: product.description || '',
    category: product.category._id,
    images: product.images as (string | File)[],
    removedImages: [] as string[]
  });
  const [previewImages, setPreviewImages] = useState<string[]>(product.images);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Store initial state to compare against
  const initialFormData = useRef({
    name: product.name,
    productCode: product.productCode,
    description: product.description || '',
    category: product.category._id,
    images: [...product.images],
    removedImages: [] as string[]
  });

  const token = localStorage.getItem('token');
  
  // Function to check if form data has changed
  const hasFormChanged = () => {
    // Check text fields
    if (
      formData.name !== initialFormData.current.name ||
      formData.description !== initialFormData.current.description ||
      formData.category !== initialFormData.current.category
    ) {
      return true;
    }
    
    // Check if images have been added or removed
    if (formData.images.length !== initialFormData.current.images.length) {
      return true;
    }
    
    // Check if any images have been removed
    if (formData.removedImages.length > 0) {
      return true;
    }
    
    // Check if any new images have been added (File objects)
    const hasNewImages = formData.images.some(img => img instanceof File);
    if (hasNewImages) {
      return true;
    }
    
    // No changes detected
    return false;
  };

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories(token);
      setCategories(categoriesData);

      // Build category map for quick lookup
      const map: Record<string, string> = {};
      categoriesData.forEach((category: Category) => {
        map[category._id] = category.name;
      });
      setCategoryMap(map);
    };

    loadCategories();

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
  }, [token, onClose]);

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
      const productData = new FormData();

      // Add all basic form fields except productCode
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('category', formData.category);

      // Handle images - separate Files from string URLs
      const fileImages = formData.images.filter(img => img instanceof File);
      const existingImages = formData.images.filter(img => !(img instanceof File));

      // Add new image files with field name 'images' (to match upload.array('images', 5))
      fileImages.forEach(image => {
        productData.append('images', image);
      });

      // Add existing image URLs as a JSON string
      productData.append('existingImages', JSON.stringify(existingImages));

      // Add removed image URLs as a JSON string
      productData.append('removedImages', JSON.stringify(formData.removedImages));

      const result = await updateProduct(product._id, productData, token);

      if (result) {
        // Ensure the updated product has the category name included
        const updatedProduct = result;

        // If the category is just an ID string, convert it to an object with ID and name
        if (typeof updatedProduct.category === 'string') {
          const categoryId = updatedProduct.category;
          updatedProduct.category = {
            _id: categoryId,
            name: categoryMap[categoryId] || 'Unknown'
          };
        }
        // If the category object doesn't have a name property but has an ID
        else if (updatedProduct.category && (!updatedProduct.category.name || updatedProduct.category.name === '') && updatedProduct.category._id) {
          updatedProduct.category.name = categoryMap[updatedProduct.category._id] || 'Unknown';
        }

        onUpdate(updatedProduct);
        onClose();
      } else {
        setErrorMessage('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrorMessage('An error occurred while updating the product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear info message when user starts making changes
    if (infoMessage) {
      setInfoMessage('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // Append new files to the existing images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));

      // Create preview URLs for display only
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
      
      // Clear info message when user starts making changes
      if (infoMessage) {
        setInfoMessage('');
      }
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = previewImages[index];

    // If it's a blob URL created for preview, revoke it to prevent memory leaks
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    } else {
      // Track the removed image URL
      setFormData(prev => ({
        ...prev,
        removedImages: [...prev.removedImages, imageToRemove]
      }));
    }

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // Clear info message when user starts making changes
    if (infoMessage) {
      setInfoMessage('');
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close edit form"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                title="Product name"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Code
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                {formData.productCode}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" id="description-label">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter product description"
                aria-labelledby="description-label"
                title="Product description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                aria-label="Product category"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (max 5 images)</p>
              </div>
            </div>
          </div>
          {previewImages.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="h-24 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`px-4 py-2 ${hasFormChanged() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} text-white rounded-lg`}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Product'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProductForm;