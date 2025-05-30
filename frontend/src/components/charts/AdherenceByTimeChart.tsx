import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeOfDayData {
  morning: { total: number; taken: number; adherenceRate: number };
  afternoon: { total: number; taken: number; adherenceRate: number };
  evening: { total: number; taken: number; adherenceRate: number };
  night: { total: number; taken: number; adherenceRate: number };
}

interface AdherenceByTimeChartProps {
  data: TimeOfDayData;
}

const AdherenceByTimeChart: React.FC<AdherenceByTimeChartProps> = ({ data }) => {
  // Transform the data for the chart
  const chartData = [
    {
      name: 'Morning',
      adherence: Math.round(data.morning.adherenceRate),
      total: data.morning.total,
      taken: data.morning.taken,
      timeRange: '5:00 AM - 11:59 AM',
    },
    {
      name: 'Afternoon',
      adherence: Math.round(data.afternoon.adherenceRate),
      total: data.afternoon.total,
      taken: data.afternoon.taken,
      timeRange: '12:00 PM - 4:59 PM',
    },
    {
      name: 'Evening',
      adherence: Math.round(data.evening.adherenceRate),
      total: data.evening.total,
      taken: data.evening.taken,
      timeRange: '5:00 PM - 8:59 PM',
    },
    {
      name: 'Night',
      adherence: Math.round(data.night.adherenceRate),
      total: data.night.total,
      taken: data.night.taken,
      timeRange: '9:00 PM - 4:59 AM',
    },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
          />
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'adherence') return [`${value}%`, 'Adherence Rate'];
              return [value, name.charAt(0).toUpperCase() + name.slice(1)];
            }}
            labelFormatter={(label, payload) => {
              const item = chartData.find(d => d.name === label);
              return `${label} (${item?.timeRange})`;
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
            yAxisId="left"
            dataKey="adherence" 
            fill="#8884d8" 
            name="Adherence Rate" 
          />
          <Bar 
            yAxisId="right"
            dataKey="total" 
            fill="#82ca9d" 
            name="Total Doses" 
          />
          <Bar 
            yAxisId="right"
            dataKey="taken" 
            fill="#ffc658" 
            name="Taken Doses" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdherenceByTimeChart;
