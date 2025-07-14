import React from 'react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

interface RecentOrder {
  id: string;
  customer: Customer;
  date: string;
  amount: number;
  status: string;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
      <div className="space-y-2">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div className="flex items-center gap-4">
                    <span className="truncate">{order.customer.email}</span>
                    <span>{order.customer.phone}</span>
                  </div>
                  <div className="truncate">
                    {order.customer.address}, {order.customer.city}, {order.customer.state}
                  </div>
                  <div className="text-gray-500">
                    {new Date(order.date).toLocaleDateString('en-AU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className="text-sm font-bold text-gray-900">
                  ${order.amount}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No recent orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;