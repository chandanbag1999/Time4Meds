import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import apiService from '@/services/api';

interface Medicine {
  _id: string;
  name: string;
}

export interface LogFilters {
  medicineId?: string;
  status?: 'all' | 'taken' | 'missed' | 'skipped';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'medicine' | 'status';
  sortOrder?: 'asc' | 'desc';
}

interface LogFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: LogFilters) => void;
  currentFilters: LogFilters;
}

const LogFilterModal: React.FC<LogFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<LogFilters>(currentFilters);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await apiService.get<Medicine[]>('/api/medicines');
        setMedicines(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        // Fallback data
        setMedicines([
          { _id: '1', name: 'Aspirin' },
          { _id: '2', name: 'Vitamin D' },
          { _id: '3', name: 'Amoxicillin' }
        ]);
      }
    };

    if (isOpen) {
      fetchMedicines();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    setLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      onApplyFilters(filters);
      setLoading(false);
      onClose();
    }, 300);
  };

  const handleReset = () => {
    const resetFilters: LogFilters = {
      medicineId: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter Logs</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {/* Medicine Filter */}
            <div>
              <label htmlFor="medicineId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medicine
              </label>
              <select
                id="medicineId"
                name="medicineId"
                value={filters.medicineId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">All Medicines</option>
                {medicines.map(medicine => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status || 'all'}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="all">All Statuses</option>
                <option value="taken">Taken</option>
                <option value="missed">Missed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={filters.dateFrom || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={filters.dateTo || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy || 'date'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="date">Date</option>
                  <option value="medicine">Medicine</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <select
                  id="sortOrder"
                  name="sortOrder"
                  value={filters.sortOrder || 'desc'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <LoadingButton
            isLoading={loading}
            loadingText="Applying..."
            onClick={handleApply}
            className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            Apply Filters
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default LogFilterModal; 