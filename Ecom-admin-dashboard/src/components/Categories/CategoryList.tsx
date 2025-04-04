import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';
import AddCategoryForm from './AddCategoryForm';
import EditCategoryForm from './EditCategoryForm';

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  deletedAt: number;
}

interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  itemToDelete?: Category;
  onConfirm: () => void;
}

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/category/all-categories');
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(prev =>
      prev.map(category =>
        category._id === updatedCategory._id ? updatedCategory : category
      )
    );
  };

  const columns = [
    {
      header: '#',
      accessor: (item: Category, index: number) => index + 1 // Display item count
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
  ];

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
  };

  const handleDelete = (category: Category) => {
    setConfirmation({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete category "${category.name}"? This action can be reversed later.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      itemToDelete: category,
      onConfirm: () => performSoftDelete(category)
    });
  };

  const performSoftDelete = async (category: Category) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/category/delete-category/${category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setCategories(prevCategories => prevCategories.filter(c => c._id !== category._id));
        console.log('Category deleted successfully');
      } else {
        console.error('Failed to delete category:', data.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
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
                placeholder="Search categories..."
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
              <span>Add Category</span>
            </motion.button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found. Add a new category to get started.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          <AnimatePresence>
            {showAddForm && (
              <AddCategoryForm
                onClose={() => setShowAddForm(false)}
                onSubmit={handleAddCategory}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {categoryToEdit && (
              <EditCategoryForm
                category={categoryToEdit}
                onClose={() => setCategoryToEdit(null)}
                onUpdate={handleUpdateCategory}
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

export default CategoryList;
