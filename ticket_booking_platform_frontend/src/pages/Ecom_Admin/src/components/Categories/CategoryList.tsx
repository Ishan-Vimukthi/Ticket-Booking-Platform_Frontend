import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';
import AddCategoryForm from './AddCategoryForm';
import EditCategoryForm from './EditCategoryForm';
import { fetchCategories, deleteCategory } from '../../services/categoryService';
import { debounce } from 'lodash';

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
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
        const categoriesData = await fetchCategories(token);
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleAddCategory = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
    setFilteredCategories(prev => [...prev, newCategory]);
    setShowAddForm(false);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(prev =>
      prev.map(category =>
        category._id === updatedCategory._id ? updatedCategory : category
      )
    );
    setFilteredCategories(prev =>
      prev.map(category =>
        category._id === updatedCategory._id ? updatedCategory : category
      )
    );
    setCategoryToEdit(null);
  };

  const columns = [
    {
      header: '#',
      accessor: (item: Category, index: number) => index + 1
    },
    { 
      header: 'Name', 
      accessor: (item: Category) => item.name 
    },
    { 
      header: 'Description', 
      accessor: (item: Category) => item.description 
    },
    {
      header: 'Created',
      accessor: (item: Category) => new Date(item.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },
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
      const success = await deleteCategory(category._id, token);
      if (success) {
        setCategories(prevCategories => prevCategories.filter(c => c._id !== category._id));
        setFilteredCategories(prevCategories => prevCategories.filter(c => c._id !== category._id));
        console.log('Category deleted successfully');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the category');
    } finally {
      closeConfirmationModal();
    }
  };

  const closeConfirmationModal = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      setFilteredCategories(
        categories.filter(category =>
          category.name.toLowerCase().includes(query.toLowerCase()) ||
          category.description.toLowerCase().includes(query.toLowerCase())
        )
      );
    }, 300),
    [categories]
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
                placeholder="Search categories..."
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
              <span>Add Category</span>
            </motion.button>
          </div>

          {!error && filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found. Add a new category to get started.</p>
            </div>
          ) : !error ? (
            <DataTable
              columns={columns}
              data={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}

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