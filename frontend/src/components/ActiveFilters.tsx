import React from 'react';
import { X } from 'lucide-react';
import { LogFilters } from './LogFilterModal';

interface ActiveFiltersProps {
  filters: LogFilters;
  onClearFilter: (key: keyof LogFilters) => void;
  onClearAll: () => void;
  medicineNames: Record<string, string>;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onClearFilter,
  onClearAll,
  medicineNames
}) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== 'all'
  );

  if (!hasActiveFilters) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const getFilterLabel = (key: keyof LogFilters, value: any): string => {
    switch (key) {
      case 'medicineId':
        return `Medicine: ${medicineNames[value] || 'Unknown'}`;
      case 'status':
        return `Status: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
      case 'dateFrom':
        return `From: ${formatDate(value)}`;
      case 'dateTo':
        return `To: ${formatDate(value)}`;
      case 'sortBy':
        return `Sort: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
      case 'sortOrder':
        return value === 'asc' ? 'Oldest First' : 'Newest First';
      default:
        return '';
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
        
        {Object.entries(filters).map(([key, value]) => {
          // Skip empty, undefined or default values
          if (
            value === undefined || 
            value === '' || 
            (key === 'status' && value === 'all') ||
            (key === 'sortBy' && value === 'date' && filters.sortOrder === 'desc')
          ) {
            return null;
          }
          
          return (
            <div 
              key={key} 
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
            >
              <span>{getFilterLabel(key as keyof LogFilters, value)}</span>
              <button
                onClick={() => onClearFilter(key as keyof LogFilters)}
                className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label={`Remove ${key} filter`}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        
        <button
          onClick={onClearAll}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters; 