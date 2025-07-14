import React, { useState, useEffect, useCallback } from 'react';
import { Search, AlertTriangle, Undo2, Trash2, X } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';
import { 
  recycleBinApi, 
  DeletedItem, 
  ItemType, 
  getItemName, 
  searchItems 
} from '../../services/recycleBinService';

interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  itemToProcess?: DeletedItem;
  actionType: 'restore' | 'permanentDelete';
  onConfirm: () => void;
}

const RecycleBinList = () => {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DeletedItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ItemType>('Categories');
  const [confirmation, setConfirmation] = useState<ConfirmationConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    actionType: 'restore',
    onConfirm: () => {}
  });

  const itemTypes: ItemType[] = ['Categories', 'Products', 'Customers', 'Orders', 'Stocks'];

  const fetchItems = useCallback(async (type: ItemType) => {
    setIsLoading(true);
    setError(null);

    try {
      const deletedItems = await recycleBinApi.fetchDeletedItems(type);
      setItems(deletedItems);
      setFilteredItems(deletedItems);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(activeFilter);
  }, [activeFilter, fetchItems]);

  const handleRestore = (item: DeletedItem) => {
    const itemName = getItemName(item);
    setConfirmation({
      isOpen: true,
      title: 'Confirm Restoration',
      message: `Are you sure you want to restore "${itemName}"? This will make it active again.`,
      confirmButtonText: 'Restore',
      cancelButtonText: 'Cancel',
      itemToProcess: item,
      actionType: 'restore',
      onConfirm: () => performRestore(item)
    });
  };

  const handlePermanentDelete = (item: DeletedItem) => {
    const itemName = getItemName(item);
    setConfirmation({
      isOpen: true,
      title: 'Confirm Permanent Deletion',
      message: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone and the item will be completely removed from the system.`,
      confirmButtonText: 'Delete Forever',
      cancelButtonText: 'Cancel',
      itemToProcess: item,
      actionType: 'permanentDelete',
      onConfirm: () => performPermanentDelete(item)
    });
  };

  const performRestore = async (item: DeletedItem) => {
    try {
      await recycleBinApi.restoreItem(activeFilter, item._id);
      
      // Remove the restored item from both lists
      setItems(prevItems => prevItems.filter(i => i._id !== item._id));
      setFilteredItems(prevItems => prevItems.filter(i => i._id !== item._id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      closeConfirmationModal();
    }
  };

  const performPermanentDelete = async (item: DeletedItem) => {
    try {
      await recycleBinApi.permanentlyDeleteItem(activeFilter, item._id);
      
      // Remove the deleted item from both lists
      setItems(prevItems => prevItems.filter(i => i._id !== item._id));
      setFilteredItems(prevItems => prevItems.filter(i => i._id !== item._id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      closeConfirmationModal();
    }
  };



  const closeConfirmationModal = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const filterItems = useCallback(() => {
    const filtered = searchItems(items, searchQuery);
    setFilteredItems(filtered);
  }, [items, searchQuery]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleFilterChange = (type: ItemType) => {
    setActiveFilter(type);
    setSearchQuery(''); // Clear search when changing filters
  };

  const renderFilterButtons = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {itemTypes.map(type => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              activeFilter === type
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    );
  };



  const getColumns = () => {
    const baseColumns = [
      {
        header: '#',
        accessor: (_item: DeletedItem, index: number) => index + 1
      }
    ];

    const actionColumn = {
      header: 'Actions',
      accessor: (item: DeletedItem) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleRestore(item)}
            className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 flex items-center gap-1 text-sm"
            title="Restore item"
          >
            <Undo2 size={14} />
            <span>Restore</span>
          </button>
          <button
            onClick={() => handlePermanentDelete(item)}
            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-1 text-sm"
            title="Permanently delete item"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )
    };

    if (activeFilter === 'Customers') {
      return [
        ...baseColumns,
        {
          header: 'Name',
          accessor: (item: DeletedItem) => getItemName(item)
        },
        {
          header: 'Email',
          accessor: (item: DeletedItem) => item.email || 'N/A'
        },
        {
          header: 'Phone',
          accessor: (item: DeletedItem) => item.phone || 'N/A'
        },
        {
          header: 'Deleted At',
          accessor: (item: DeletedItem) => new Date(item.deletedAt).toLocaleString()
        },
        actionColumn
      ];
    }

    if (activeFilter === 'Orders') {
      return [
        ...baseColumns,
        {
          header: 'Customer',
          accessor: (item: DeletedItem) => getItemName(item)
        },
        {
          header: 'Total Amount',
          accessor: (item: DeletedItem) => item.totalAmount ? `${(item.totalAmount / 100).toFixed(2)}` : 'N/A'
        },
        {
          header: 'Status',
          accessor: (item: DeletedItem) => item.status || 'N/A'
        },
        {
          header: 'Items Count',
          accessor: (item: DeletedItem) => item.items ? item.items.length : 0
        },
        {
          header: 'Deleted At',
          accessor: (item: DeletedItem) => new Date(item.deletedAt).toLocaleString()
        },
        actionColumn
      ];
    }

    if (activeFilter === 'Stocks') {
      return [
        ...baseColumns,
        {
          header: 'Product',
          accessor: (item: DeletedItem) => getItemName(item)
        },
        {
          header: 'Product Code',
          accessor: (item: DeletedItem) => item.product?.productCode || 'N/A'
        },
        {
          header: 'Batch Number',
          accessor: (item: DeletedItem) => item.batchNumber || 'N/A'
        },
        {
          header: 'Quantity',
          accessor: (item: DeletedItem) => item.quantity || 0
        },
        {
          header: 'Supplier',
          accessor: (item: DeletedItem) => item.supplier || 'N/A'
        },
        {
          header: 'Deleted At',
          accessor: (item: DeletedItem) => new Date(item.deletedAt).toLocaleString()
        },
        actionColumn
      ];
    }

    // Default columns for Categories and Products
    return [
      ...baseColumns,
      {
        header: 'Name',
        accessor: (item: DeletedItem) => getItemName(item)
      },
      {
        header: 'Description',
        accessor: (item: DeletedItem) => item.description || 'N/A'
      },
      {
        header: 'Deleted At',
        accessor: (item: DeletedItem) => new Date(item.deletedAt).toLocaleString()
      },
      actionColumn
    ];
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
              <button
                title='Close message'
                onClick={() => setError(null)}
                className="ml-auto text-red-700 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-shrink-0">
              {renderFilterButtons()}
            </div>

            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search deleted items..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          {!error && filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <AlertTriangle size={48} className="mx-auto text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No deleted {activeFilter.toLowerCase()} found.</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery ? 'Try adjusting your search terms.' : 'All items are currently active.'}
              </p>
            </div>
          ) : !error ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Deleted {activeFilter} ({filteredItems.length})
                  </h2>
                </div>
              </div>
              <DataTable
                columns={getColumns()}
                data={filteredItems}
              />
            </div>
          ) : null}

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

export default RecycleBinList;