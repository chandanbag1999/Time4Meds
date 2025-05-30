import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface DayData {
  total: number;
  taken: number;
  adherenceRate: number;
}

interface AdherenceByDayChartProps {
  data?: DayData[];
  className?: string;
}

/**
 * AdherenceByDayChart - Displays medication adherence statistics by day of week
 *
 * This component visualizes three metrics:
 * 1. Adherence Rate (%) - Primary Y-axis (left)
 * 2. Total Doses - Secondary Y-axis (right)
 * 3. Taken Doses - Secondary Y-axis (right)
 */
const AdherenceByDayChart: React.FC<AdherenceByDayChartProps> = ({
  data = [],
  className = ""
}) => {
  // Process and validate chart data
  const chartData = useMemo(() => {
    // Day names for mapping index to day of week (moved inside useMemo to avoid dependency issues)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Handle empty data case
    if (!data || data.length === 0) {
      // Return empty array for empty state handling
      return [];
    }

    // Map data to chart format with validation
    return data.map((day, index) => {
      // Ensure index is within bounds of dayNames array
      const dayIndex = index % 7;

      return {
        name: dayNames[dayIndex],
        // Ensure adherenceRate is a valid number between 0-100
        adherence: Math.min(100, Math.max(0, Math.round(day.adherenceRate || 0))),
        // Ensure total and taken are valid non-negative numbers
        total: Math.max(0, day.total || 0),
        taken: Math.max(0, day.taken || 0),
        // Calculate missed doses for tooltip
        missed: Math.max(0, (day.total || 0) - (day.taken || 0))
      };
    });
  }, [data]);

  // Custom tooltip formatter with improved type safety
  const customTooltipFormatter = (
    value: number | string,
    name: string
  ): [string | number, string] => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return ['N/A', name];
    }

    switch (name) {
      case 'adherence':
        return [`${value}%`, 'Adherence Rate'];
      case 'total':
        return [value, 'Total Doses'];
      case 'taken':
        return [value, 'Taken Doses'];
      default:
        // Capitalize first letter for other metrics
        return [value, name.charAt(0).toUpperCase() + name.slice(1)];
    }
  };

  // Custom colors that work well in both light and dark themes
  const barColors = {
    adherence: '#8884d8', // Purple
    total: '#82ca9d',     // Green
    taken: '#ffc658'      // Amber
  };

  // Empty state component when no data is available
  if (chartData.length === 0) {
    return (
      <div className={`w-full h-[300px] flex flex-col items-center justify-center ${className}`}>
        <svg
          className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No adherence data available
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full h-[300px] ${className}`} aria-label="Medication adherence by day of week chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
          aria-label="Bar chart showing medication adherence by day of week"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.2}
            stroke="currentColor"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
            label={{
              value: 'Adherence (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'currentColor' },
              dy: 50
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
            label={{
              value: 'Doses',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: 'currentColor' },
              dy: 40
            }}
          />
          <Tooltip
            formatter={customTooltipFormatter}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, rgba(255, 255, 255, 0.9))',
              color: 'var(--tooltip-text, #333)',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            labelStyle={{
              fontWeight: 'bold',
              marginBottom: '5px'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value: string) => <span style={{ color: 'currentColor' }}>{value}</span>}
          />
          <Bar
            yAxisId="left"
            dataKey="adherence"
            name="Adherence Rate"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`adherence-${index}`}
                fill={barColors.adherence}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
          <Bar
            yAxisId="right"
            dataKey="total"
            name="Total Doses"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`total-${index}`}
                fill={barColors.total}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
          <Bar
            yAxisId="right"
            dataKey="taken"
            name="Taken Doses"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`taken-${index}`}
                fill={barColors.taken}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdherenceByDayChart;
