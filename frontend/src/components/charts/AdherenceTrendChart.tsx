import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
  weekStart: string;
  weekEnd: string;
  total: number;
  taken: number;
  adherenceRate: number;
}

interface AdherenceTrendChartProps {
  data: TrendData[];
}

const AdherenceTrendChart: React.FC<AdherenceTrendChartProps> = ({ data }) => {
  // Format the data for the chart
  const chartData = data.map(week => ({
    name: formatDateRange(week.weekStart, week.weekEnd),
    adherence: Math.round(week.adherenceRate),
    total: week.total,
    taken: week.taken,
  }));

  function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Format as "MMM D" (e.g., "Jan 1")
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'adherence') return [`${value}%`, 'Adherence Rate'];
              return [value, name.charAt(0).toUpperCase() + name.slice(1)];
            }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="adherence"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Adherence Rate"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="total" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Total Doses"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="taken" 
            stroke="#ffc658" 
            strokeWidth={2}
            name="Taken Doses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdherenceTrendChart;
