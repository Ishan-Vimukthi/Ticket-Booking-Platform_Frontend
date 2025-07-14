import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { updateCategory } from '../../services/categoryService';

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  deletedAt: number;
}

interface EditCategoryFormProps {
  category: Category;
  onClose: () => void;
  onUpdate: (updatedCategory: Category) => void;
}

const EditCategoryForm: React.FC<EditCategoryFormProps> = ({ category, onClose, onUpdate }) => {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Store initial values for comparison
  const initialValues = useRef({
    name: category.name,
    description: category.description
  });

  // Update form if category prop changes
  useEffect(() => {
    setName(category.name);
    setDescription(category.description);
    // Also update the initial values reference when category changes
    initialValues.current = {
      name: category.name,
      description: category.description
    };
  }, [category]);

  useEffect(() => {
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
  }, [onClose]);
  
  // Function to check if form data has changed
  const hasFormChanged = () => {
    return name !== initialValues.current.name || description !== initialValues.current.description;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setInfoMessage('');
    
    // Check if form data has changed
    if (!hasFormChanged()) {
      setInfoMessage('No changes detected. Update skipped.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const updatedCategory = await updateCategory(category._id, name, description, token);
      onUpdate({
        ...category,
        name,
        description,
        ...updatedCategory
      });
      onClose();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred while updating the category');
      console.error('Error updating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      setName(value);
    } else if (name === 'description') {
      setDescription(value);
    }
    
    // Clear info message when user starts making changes
    if (infoMessage) {
      setInfoMessage('');
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to parent
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Category</h2>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle size={20} className="mr-2" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {infoMessage && (
          <motion.div
            className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Info size={20} className="mr-2" />
            <span>{infoMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Category Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Enter category name"
              aria-label="Category name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Enter category description"
              aria-label="Category description"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 ${hasFormChanged() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} text-white rounded-lg disabled:opacity-50`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Updating...' : 'Update Category'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditCategoryForm;