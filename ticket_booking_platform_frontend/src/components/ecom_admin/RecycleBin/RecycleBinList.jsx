import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, RotateCcw, X } from 'lucide-react';

const RecycleBinList = () => {
  const [deletedItems, setDeletedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading deleted items
    const loadDeletedItems = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setDeletedItems([
          { 
            _id: '1', 
            name: 'Old T-Shirt Design',
            type: 'product',
            deletedDate: '2024-07-08',
            deletedBy: 'admin@bigidea.com'
          },
          { 
            _id: '2', 
            name: 'Vintage Category',
            type: 'category',
            deletedDate: '2024-07-05',
            deletedBy: 'admin@bigidea.com'
          },
          { 
            _id: '3', 
            name: 'Cancelled Order #ORD-999',
            type: 'order',
            deletedDate: '2024-07-03',
            deletedBy: 'admin@bigidea.com'
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    loadDeletedItems();
  }, []);

  const filteredItems = deletedItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'product':
        return 'bg-blue-100 text-blue-800';
      case 'category':
        return 'bg-green-100 text-green-800';
      case 'order':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRestore = (itemId) => {
    setDeletedItems(prev => prev.filter(item => item._id !== itemId));
    // Here you would typically make an API call to restore the item
    console.log('Restoring item:', itemId);
  };

  const handlePermanentDelete = (itemId) => {
    setDeletedItems(prev => prev.filter(item => item._id !== itemId));
    // Here you would typically make an API call to permanently delete the item
    console.log('Permanently deleting item:', itemId);
  };

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
        <h1 className="text-2xl font-bold">Recycle Bin</h1>
        <div className="text-sm text-gray-500">
          Items are automatically deleted after 30 days
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Deleted Items Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <motion.tr
                key={item._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 size={20} className="text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.deletedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.deletedBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRestore(item._id)}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                    >
                      <RotateCcw size={16} />
                      Restore
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(item._id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                    >
                      <X size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Recycle bin is empty</p>
        </div>
      )}
    </div>
  );
};

export default RecycleBinList;
