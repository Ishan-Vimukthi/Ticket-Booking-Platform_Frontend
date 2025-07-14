import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SalesByCategory {
  _id: string;
  categoryName: string;
  totalSales: number;
  count: number;
}

interface CategoryChartProps {
  data: SalesByCategory[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const COLORS = ['#4F46E5', '#EC4899', '#312E81', '#BE185D', '#059669', '#DC2626'];
  
  const chartData = data.map(item => ({
    name: item.categoryName,
    value: item.totalSales,
    count: item.count
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Sales by Categories</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;