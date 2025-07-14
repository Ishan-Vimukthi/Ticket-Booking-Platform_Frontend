import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Boxes, AlertTriangle, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { productService } from '../../../services/ecom_admin/productService';
import { toast } from 'react-toastify';

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockSummary, setStockSummary] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalStockValue: 0
  });

  const loadStockData = async () => {
    setIsLoading(true);
    try {
      console.log('📦 Loading stock data...');
      
      // Get products from the product service (simplified approach)
      const productResult = await productService.getAllProducts();
      
      if (productResult.success) {
        const productsData = productResult.data;
        
        // Transform products into simple stock data
        const stockData = productsData.map(product => {
          const quantity = product.quantity || 0;
          
          // Simple status logic
          let status = 'healthy';
          if (quantity === 0) {
            status = 'out_of_stock';
          } else if (quantity <= 20) {
            status = 'low';
          } else if (quantity <= 40) {
            status = 'medium';
          }
          
          return {
            _id: product._id,
            name: product.name,
            sku: product.sku || `PROD-${product._id?.slice(-6) || '000'}`,
            image: product.images?.[0],
            price: product.price || 0,
            quantity: quantity,
            status: status,
            sizes: product.sizes || [],
            colors: product.colors || [],
            updatedAt: product.updatedAt || product.createdAt || new Date().toISOString()
          };
        });
        
        setStocks(stockData);
        
        // Calculate simple summary
        const summary = {
          totalProducts: stockData.length,
          lowStockItems: stockData.filter(s => s.status === 'low' || s.status === 'medium').length,
          outOfStock: stockData.filter(s => s.status === 'out_of_stock').length,
          totalStockValue: stockData.reduce((total, stock) => total + (stock.quantity * stock.price), 0)
        };
        setStockSummary(summary);
        
        console.log('✅ Stock data loaded successfully:', stockData.length, 'items');
      } else {
        console.error('❌ Failed to load products:', productResult.error);
        toast.error('Failed to load stock data');
      }
    } catch (error) {
      console.error('❌ Error loading stock data:', error);
      toast.error('Error loading stock data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'low':
        return <AlertTriangle size={16} className="text-orange-600" />;
      case 'medium':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'out_of_stock':
        return <Package size={16} className="text-red-600" />;
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-gray-500 mt-1">Monitor inventory levels</p>
        </div>
        <button
          onClick={loadStockData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
              <p className="text-2xl font-bold mt-1">{stockSummary.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Boxes size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Low Stock</h3>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stockSummary.lowStockItems}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Out of Stock</h3>
              <p className="text-2xl font-bold mt-1 text-red-600">{stockSummary.outOfStock}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Package size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
              <p className="text-2xl font-bold mt-1 text-green-600">
                ${stockSummary.totalStockValue.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Stock Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStocks.map((stock) => (
                <motion.tr
                  key={stock._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {stock.image ? (
                          <img 
                            src={stock.image} 
                            alt={stock.name}
                            className="h-12 w-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                        <div className="text-sm text-gray-500">{stock.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">{stock.quantity}</div>
                    <div className="text-xs text-gray-500">units</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(stock.status)}`}>
                      {getStatusIcon(stock.status)}
                      <span className="ml-1 capitalize">
                        {stock.status === 'out_of_stock' ? 'Out of Stock' : stock.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ${(stock.quantity * stock.price).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">@${stock.price}/unit</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(stock.updatedAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStocks.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Boxes size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search.' : 'No products available yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockList;
