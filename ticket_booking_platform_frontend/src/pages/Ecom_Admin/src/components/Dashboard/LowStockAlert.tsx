import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LowStockItem {
  id: string;
  product: string;
  batchNumber: string;
  quantity: number;
  lowStockAlert: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alert</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
            <div>
              <p className="font-medium">{item.product}</p>
              <p className="text-xs text-gray-600">{item.batchNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-red-600">{item.quantity} left</p>
              <p className="text-xs text-gray-500">Alert at {item.lowStockAlert}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;