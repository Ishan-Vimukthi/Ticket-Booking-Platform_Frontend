import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StockData {
  totalStock: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
}

interface StockChartProps {
  data: StockData;
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const stockData = [
    { name: 'Total Stock', value: data.totalStock, color: '#4F46E5' },
    { name: 'Low Stock', value: data.lowStock, color: '#F59E0B' },
    { name: 'Out of Stock', value: data.outOfStock, color: '#EF4444' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Stock Status</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Inventory Value: <span className="font-semibold text-green-600">${data.inventoryValue.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
};

export default StockChart;