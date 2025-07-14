import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Grid, RefreshCw, AlertCircle } from 'lucide-react';
import { categoryService } from '../../../services/ecom_admin/categoryService.js';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await categoryService.getAllCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.error || 'Failed to load categories');
      }
    } catch (error) {
      setError('Failed to load categories: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCategories = async () => {
    setIsInitializing(true);
    try {
      const result = await categoryService.initializeDefaultCategories();
      if (result.success) {
        await loadCategories(); // Reload categories
        alert(result.message || 'Categories initialized successfully!');
      } else {
        alert('Failed to initialize categories: ' + result.error);
      }
    } catch (error) {
      alert('Failed to initialize categories: ' + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeCategories}
              disabled={isInitializing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isInitializing ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
              {isInitializing ? 'Initializing...' : 'Initialize Categories'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadCategories}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add Category
          </motion.button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Grid size={24} className="text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500">{category.productCount || 0} products</span>
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>

            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center gap-1">
                <Edit size={16} />
                Edit
              </button>
              <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 flex items-center justify-center gap-1">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Grid size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">
            {categories.length === 0 ? 'No categories found. Create categories first before adding products.' : 'No categories match your search.'}
          </p>
          {categories.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeCategories}
              disabled={isInitializing}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {isInitializing ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
              {isInitializing ? 'Initializing...' : 'Initialize Default Categories'}
            </motion.button>
          )}
        </div>
      )}

      {/* Add Category Modal - Placeholder */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Enter category description"
                ></textarea>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
