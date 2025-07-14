import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const AddProductForm = ({ onClose, onSubmit, isEdit = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [],
    sizes: [],
    colors: [],
    quantity: '',
    sku: '',
    material: '',
    careInstructions: '',
    isActive: true
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'];

  // Populate form when editing
  useEffect(() => {
    if (isEdit && initialData) {
      console.log('🔄 AddProductForm: Populating form with initial data:', initialData);
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        images: initialData.images || [],
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        quantity: initialData.quantity || '',
        sku: initialData.sku || initialData.productCode || '', // Handle both sku and productCode
        material: initialData.material || '',
        careInstructions: initialData.careInstructions || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
      console.log('✅ AddProductForm: Form populated for editing');
    }
  }, [isEdit, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => {
      const url = URL.createObjectURL(file);
      return { file, url, name: file.name };
    });
    
    setImageFiles(prev => [...prev, ...newImages]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages.map(img => img.url)]
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields (Name and Description)');
      return;
    }

    // Generate product code if not provided
    const productCode = formData.sku || `TS-${Date.now()}`;
    
    // Prepare product data with actual File objects for images
    const productData = {
      name: formData.name,
      description: formData.description,
      productCode: productCode,
      images: imageFiles.map(img => img.file), // Pass actual File objects
      // E-commerce fields (Essential for shop functionality)
      price: formData.price ? parseFloat(formData.price) : 0,       // Default to 0
      quantity: formData.quantity ? parseInt(formData.quantity) : 0, // Default to 0
      sizes: formData.sizes,                                         // Array of sizes
      colors: formData.colors,                                       // Array of colors
      material: formData.material,
      careInstructions: formData.careInstructions,
      isActive: formData.isActive
    };

    console.log('Submitting product data:', productData);
    onSubmit(productData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Edit Product' : 'Add New T-Shirt Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Classic Cotton T-Shirt"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe the t-shirt features, fit, and style..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="29.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU (Auto-generated if empty)
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="TS-001"
                    />
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Sizes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.sizes.includes(size)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.colors.includes(color)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Images</h3>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                >
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                  <label className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
                </div>

                {/* Image Preview */}
                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {imageFiles.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 100% Cotton"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Care Instructions
                    </label>
                    <textarea
                      name="careInstructions"
                      value={formData.careInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Machine wash cold, tumble dry low..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active (visible on storefront)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProductForm;
