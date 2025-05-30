import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AdherenceOverviewChartProps {
  data: {
    total: number;
    taken: number;
    skipped: number;
    missed: number;
    adherenceRate: number;
  };
}

const AdherenceOverviewChart: React.FC<AdherenceOverviewChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Taken', value: data.taken, color: '#10b981' }, // green
    { name: 'Skipped', value: data.skipped, color: '#f59e0b' }, // amber
    { name: 'Missed', value: data.missed, color: '#ef4444' }, // red
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="w-full h-[300px]">
      <div className="flex flex-col items-center mb-4">
        <div className="text-3xl font-bold">
          {data.adherenceRate.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Overall Adherence Rate
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} doses`, '']}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-semibold text-emerald-500">{data.taken}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Taken</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-amber-500">{data.skipped}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Skipped</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-red-500">{data.missed}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Missed</div>
        </div>
      </div>
    </div>
  );
};

export default AdherenceOverviewChart;
