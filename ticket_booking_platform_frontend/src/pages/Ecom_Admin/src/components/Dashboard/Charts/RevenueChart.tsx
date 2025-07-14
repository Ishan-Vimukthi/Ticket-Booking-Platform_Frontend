import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface RevenueData {
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
}

interface RevenueChartProps {
  data: RevenueData['revenueByPeriod'];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    orders: item.orderCount
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;