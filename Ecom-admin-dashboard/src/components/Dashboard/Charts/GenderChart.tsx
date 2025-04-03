import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', male: 30, female: 25 },
  { month: 'Feb', male: 35, female: 30 },
  { month: 'Mar', male: 25, female: 35 },
  { month: 'Apr', male: 30, female: 40 },
  { month: 'May', male: 40, female: 35 },
  { month: 'Jun', male: 35, female: 30 },
  { month: 'Jul', male: 45, female: 35 },
  { month: 'Aug', male: 40, female: 40 },
  { month: 'Sep', male: 35, female: 45 },
  { month: 'Oct', male: 45, female: 40 },
  { month: 'Nov', male: 40, female: 35 },
  { month: 'Dec', male: 45, female: 40 },
];

const GenderChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Sales by Gender</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="male"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="female"
              stroke="#EC4899"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-end mt-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
          <span className="text-sm text-gray-600">Male 48%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
          <span className="text-sm text-gray-600">Female 52%</span>
        </div>
      </div>
    </div>
  );
};

export default GenderChart;