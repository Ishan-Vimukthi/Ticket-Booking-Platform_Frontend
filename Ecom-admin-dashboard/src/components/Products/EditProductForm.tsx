import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import LoadingSpinner from '../Loading/LoadingSpinner';

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
  description?: string;
  size: string;
  color: string;
  price: number;
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
    size: product.size,
    color: product.color,
    price: product.price,
    images: product.images
  });
  const [previewImages, setPreviewImages] = useState<string[]>(product.images);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const colors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple',
    'Orange', 'Pink', 'Brown', 'Gray', 'Navy', 'Beige', 'Maroon'
  ];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/category/all-categories');
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setCategories(data.data);
          
          // Build category map for quick lookup
          const map: Record<string, string> = {};
          data.data.forEach((category: Category) => {
            map[category._id] = category.name;
          });
          setCategoryMap(map);
        } else {
          console.error('Failed to fetch categories:', data.message);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const productData = new FormData();
      
      // Add all basic form fields
      productData.append('name', formData.name);
      productData.append('productCode', formData.productCode);
      productData.append('description', formData.description);
      productData.append('category', formData.category);
      productData.append('size', formData.size);
      productData.append('color', formData.color);
      productData.append('price', formData.price.toString());
      
      // Handle images - separate Files from string URLs
      const fileImages = formData.images.filter(img => img instanceof File);
      
      // Add new image files with field name 'images' (to match upload.array('images', 5))
      fileImages.forEach(image => {
        productData.append('images', image);
      });
      
      const token = localStorage.getItem('token');
      
      // Log the FormData for debugging
      console.log('Submitting form with data:');
      for (let pair of productData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await fetch(`http://localhost:3000/product/update-product/${product._id}`, {
        method: 'PUT',
        body: productData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.status === "SUCCESS") {
        // Ensure the updated product has the category name included
        const updatedProduct = result.data;
        
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
        setErrorMessage(result.message || 'Failed to update product');
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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      
      // Store actual File objects in formData.images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));
      
      // Create preview URLs for display only
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // If it's a blob URL created for preview, revoke it to prevent memory leaks
    if (previewImages[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewImages[index]);
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {isLoading && <LoadingSpinner />}
      <motion.div
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
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errorMessage}
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Code*
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
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
              >
                <option value="">Select size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color*
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select color</option>
                {colors.map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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