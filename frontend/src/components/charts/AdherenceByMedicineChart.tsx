import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface MedicineData {
  medicineId: string;
  name: string;
  dosage: string;
  total: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number;
}

interface AdherenceByMedicineChartProps {
  data: MedicineData[];
}

const AdherenceByMedicineChart: React.FC<AdherenceByMedicineChartProps> = ({ data }) => {
  // Sort data by adherence rate (descending)
  const sortedData = [...data].sort((a, b) => b.adherenceRate - a.adherenceRate);
  
  // Format the data for the chart
  const chartData = sortedData.map(medicine => ({
    name: medicine.name,
    adherence: Math.round(medicine.adherenceRate),
    total: medicine.total,
    taken: medicine.taken,
    skipped: medicine.skipped,
    missed: medicine.missed,
    dosage: medicine.dosage,
  }));

  // Generate colors based on adherence rate
  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return '#10b981'; // green
    if (adherence >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'adherence') return [`${value}%`, 'Adherence Rate'];
              return [value, name.charAt(0).toUpperCase() + name.slice(1)];
            }}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.name === label);
              return `${label} (${item?.dosage})`;
            }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="adherence" 
            name="Adherence Rate" 
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getAdherenceColor(entry.adherence)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Additional statistics table */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Taken</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skipped</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Missed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Adherence</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {chartData.map((medicine, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{medicine.name}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{medicine.total}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{medicine.taken}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{medicine.skipped}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{medicine.missed}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium" style={{ color: getAdherenceColor(medicine.adherence) }}>
                  {medicine.adherence}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdherenceByMedicineChart;
