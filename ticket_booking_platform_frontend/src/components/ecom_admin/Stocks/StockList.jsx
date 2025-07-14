import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Boxes, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading stocks
    const loadStocks = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setStocks([
          { 
            _id: '1', 
            product: { name: 'Sample T-Shirt', productCode: 'TS001' },
            currentStock: 100,
            minStockLevel: 20,
            maxStockLevel: 200,
            lastUpdated: '2024-07-10',
            status: 'healthy'
          },
          { 
            _id: '2', 
            product: { name: 'Sample Hoodie', productCode: 'HD001' },
            currentStock: 15,
            minStockLevel: 20,
            maxStockLevel: 150,
            lastUpdated: '2024-07-11',
            status: 'low'
          },
          { 
            _id: '3', 
            product: { name: 'Sample Jeans', productCode: 'JN001' },
            currentStock: 75,
            minStockLevel: 10,
            maxStockLevel: 100,
            lastUpdated: '2024-07-12',
            status: 'healthy'
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    loadStocks();
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.product.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'low':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'medium':
        return <TrendingDown size={16} className="text-yellow-600" />;
      default:
        return <Boxes size={16} className="text-gray-600" />;
    }
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
        <h1 className="text-2xl font-bold">Stock Management</h1>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Products</h3>
              <p className="text-2xl font-bold mt-1">{stocks.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Boxes size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {stocks.filter(s => s.status === 'low').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Stock Value</h3>
              <p className="text-2xl font-bold mt-1 text-green-600">$24,500</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.map((stock) => (
              <motion.tr
                key={stock._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Boxes size={20} className="text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{stock.product.name}</div>
                      <div className="text-sm text-gray-500">{stock.product.productCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{stock.currentStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.minStockLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.maxStockLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stock.status)}`}>
                    {getStatusIcon(stock.status)}
                    <span className="ml-1">{stock.status.charAt(0).toUpperCase() + stock.status.slice(1)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(stock.lastUpdated).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStocks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Boxes size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No stock records found</p>
        </div>
      )}
    </div>
  );
};

export default StockList;
