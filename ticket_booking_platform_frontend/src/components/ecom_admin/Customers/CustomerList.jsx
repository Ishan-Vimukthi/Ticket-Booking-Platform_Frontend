import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Mail, Phone, RefreshCw, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { orderService } from '../../../services/ecom_admin/orderService';
import { customerService } from '../../../services/ecom_admin/customerService';
import { toast } from 'react-toastify';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSummary, setCustomerSummary] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0
  });

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      console.log('👥 Loading customer data...');
      
      // First, try to get customer analytics from backend
      const analyticsResult = await customerService.getCustomerAnalytics();
      
      if (analyticsResult.success) {
        console.log('✅ Using real customer analytics from backend');
        const realAnalytics = analyticsResult.data;
        
        setCustomerSummary({
          totalCustomers: realAnalytics.totalCustomers,
          newCustomers: realAnalytics.newCustomersThisMonth,
          activeCustomers: realAnalytics.totalCustomers - realAnalytics.newCustomersThisMonth,
          totalRevenue: realAnalytics.totalRevenue
        });
        
        console.log('📊 Real analytics loaded:', realAnalytics);
        toast.success(`Real customer analytics loaded: ${realAnalytics.totalCustomers} customers, $${realAnalytics.totalRevenue} revenue`);
      }
      
      // Try to get customers from dedicated customer endpoint
      const customerResult = await customerService.getAllCustomers();
      
      console.log('🔍 Customer result:', customerResult);
      
      if (customerResult.success && customerResult.data && customerResult.data.length > 0) {
        console.log('✅ Using real customer data from backend - Found', customerResult.data.length, 'customers');
        
        // Process real customer data
        const customersWithTypes = customerResult.data.map(customer => ({
          ...customer,
          // Use backend customerType if available, otherwise calculate
          customerType: customer.customerType || customerService.getCustomerType(
            customer.stats?.totalOrders || customer.totalOrders || 0,
            customer.stats?.totalSpent || customer.totalSpent || 0
          )
        }));
        
        setCustomers(customersWithTypes);
        console.log('✅ Customer data loaded:', customersWithTypes.length, 'customers');
        console.log('📊 Customer details:', customersWithTypes);
        toast.success(`Real customer data loaded: ${customersWithTypes.length} customers with complete profiles`);
        return;
      } else {
        console.log('⚠️ Customer endpoint returned empty or failed:', customerResult);
      }
      
      // If customer endpoint returns empty data, check if we have real analytics
      if (analyticsResult.success && analyticsResult.data.totalCustomers > 0) {
        console.log('📊 Analytics shows customers exist, but customer endpoint empty. Trying orders fallback...');
      }
      
      // Check if we have authentication token for orders fallback
      const token = localStorage.getItem('ecom_token');
      if (!token) {
        console.log('⚠️ No authentication token found. Creating enhanced mock data based on analytics.');
        
        // Create enhanced mock customer data based on real analytics
        const realAnalytics = analyticsResult.data || {};
        const mockCustomersWithAnalytics = [];
        
        // Create mock customers based on real analytics
        for (let i = 1; i <= (realAnalytics.totalCustomers || 1); i++) {
          mockCustomersWithAnalytics.push({
            _id: `customer_${i}`,
            email: `customer${i}@example.com`,
            name: `Customer ${i}`,
            phone: `+1-555-012${i}`,
            totalOrders: Math.ceil((realAnalytics.totalOrders || 1) / (realAnalytics.totalCustomers || 1)),
            totalSpent: (realAnalytics.totalRevenue || 0) / (realAnalytics.totalCustomers || 1),
            firstOrderDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            lastOrderDate: new Date().toISOString(),
            customerType: i === 1 ? 'Loyal' : i === 2 ? 'Regular' : 'New'
          });
        }
        
        setCustomers(mockCustomersWithAnalytics);
        console.log('✅ Using enhanced mock data that matches real analytics');
        toast.success(`Demo mode: ${mockCustomersWithAnalytics.length} customers based on real analytics`);
        return;
      }
      
      // Fallback: Get customer data from orders
      console.log('📋 Falling back to order aggregation for customer data');
      
      // Get all orders to extract customer information
      const orderResult = await orderService.getAllOrders();
      
      if (orderResult.success) {
        const orders = orderResult.data;
        console.log('📋 Orders received:', orders.length);
        
        // Group orders by customer email to create customer profiles
        const customerMap = new Map();
        
        orders.forEach(order => {
          const customerEmail = order.customer?.email || order.email;
          const customerName = order.customer?.name || `${order.firstName || ''} ${order.lastName || ''}`.trim();
          const customerPhone = order.customer?.phone || order.phone;
          
          if (!customerEmail) return; // Skip orders without customer email
          
          if (customerMap.has(customerEmail)) {
            // Update existing customer
            const existingCustomer = customerMap.get(customerEmail);
            existingCustomer.orders.push(order);
            existingCustomer.totalSpent += order.total || 0;
            existingCustomer.orderCount += 1;
          } else {
            // Create new customer profile
            customerMap.set(customerEmail, {
              _id: customerEmail, // Use email as unique ID
              name: customerName || 'Unknown Customer',
              email: customerEmail,
              phone: customerPhone || 'N/A',
              orders: [order],
              orderCount: 1,
              totalSpent: order.total || 0,
              firstOrderDate: order.createdAt || order.orderDate || new Date().toISOString(),
              lastOrderDate: order.createdAt || order.orderDate || new Date().toISOString(),
              status: 'active'
            });
          }
        });
        
        // Convert Map to Array and sort by total spent (best customers first)
        const customerData = Array.from(customerMap.values())
          .map(customer => ({
            ...customer,
            // Update last order date if there are multiple orders
            lastOrderDate: customer.orders.reduce((latest, order) => {
              const orderDate = new Date(order.createdAt || order.orderDate);
              return orderDate > new Date(latest) ? orderDate.toISOString() : latest;
            }, customer.firstOrderDate)
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent);
        
        setCustomers(customerData);
        
        // Calculate customer summary
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const summary = {
          totalCustomers: customerData.length,
          newCustomers: customerData.filter(c => new Date(c.firstOrderDate) > thirtyDaysAgo).length,
          activeCustomers: customerData.filter(c => c.orderCount > 1).length,
          totalRevenue: customerData.reduce((total, customer) => total + customer.totalSpent, 0)
        };
        setCustomerSummary(summary);
        
        console.log('✅ Customer data processed successfully:', customerData.length, 'unique customers');
      } else {
        console.error('❌ Failed to load orders:', orderResult.error);
        toast.error('Failed to load customer data');
      }
    } catch (error) {
      console.error('❌ Error loading customer data:', error);
      toast.error('Error loading customer data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      (customer.name || '').toLowerCase().includes(searchLower) ||
      (customer.email || '').toLowerCase().includes(searchLower) ||
      (customer.phone || '').toLowerCase().includes(searchLower)
    );
  });

  // Debug logging to see what's happening with the data
  console.log('🔍 CustomerList Debug:');
  console.log('- customers array:', customers);
  console.log('- customers length:', customers.length);
  console.log('- filteredCustomers length:', filteredCustomers.length);
  console.log('- searchQuery:', searchQuery);
  console.log('- isLoading:', isLoading);

  const getCustomerType = (customer) => {
    // Use customerType from backend if available, otherwise calculate
    const type = customer.customerType || customerService.getCustomerType(customer);
    const colorClass = customerService.getCustomerTypeColor(type);
    return { label: type, color: colorClass };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-500">Customers who have placed orders</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Analytics
            </div>
            {!localStorage.getItem('ecom_token') && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Demo Mode
              </div>
            )}
          </div>
        </div>
        <button
          onClick={loadCustomerData}
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
              <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
              <p className="text-2xl font-bold mt-1">{customerSummary.totalCustomers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">New (30 days)</h3>
              <p className="text-2xl font-bold mt-1 text-green-600">{customerSummary.newCustomers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Active Customers</h3>
              <p className="text-2xl font-bold mt-1 text-purple-600">{customerSummary.activeCustomers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ShoppingCart size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <p className="text-2xl font-bold mt-1 text-green-600">
                ${customerSummary.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign size={24} className="text-green-600" />
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
            placeholder="Search customers..."
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

      {/* Customers Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const customerType = getCustomerType(customer);
                return (
                  <motion.tr
                    key={customer._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Users size={20} className="text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">Customer ID: {customer._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1 mb-1">
                        <Mail size={16} className="text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone size={16} className="text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">{customer.orderCount}</div>
                      <div className="text-xs text-gray-500">orders</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: ${(customer.totalSpent / customer.orderCount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${customerType.color}`}>
                        {customerType.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(customer.firstOrderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCustomers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search.' 
              : 'No customers yet. Customers will appear here when orders are placed.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
