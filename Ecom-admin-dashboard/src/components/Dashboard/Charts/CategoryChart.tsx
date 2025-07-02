import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Shirts', value: 30 },
  { name: 'Tops & T-Shirts', value: 25 },
  { name: 'Skirts & Shorts', value: 20 },
  { name: 'Jeans & Trousers', value: 25 },
];

const COLORS = ['#4F46E5', '#EC4899', '#312E81', '#BE185D'];

const CategoryChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Sales by Categories</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;