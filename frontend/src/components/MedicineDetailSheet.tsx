import React from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetHeader, SheetTitle, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button-modern";

interface Medicine {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  time?: string;
  isActive: boolean;
  createdAt: string;
}

interface MedicineDetailSheetProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onLogMedicine: (id: string, name: string, status: 'taken' | 'skipped') => void;
  isActionLoading?: boolean;
}

const MedicineDetailSheet: React.FC<MedicineDetailSheetProps> = ({
  medicine,
  isOpen,
  onClose,
  onDelete,
  onLogMedicine,
  isActionLoading = false,
}) => {
  if (!medicine) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      size="lg"
      className="rounded-t-xl"
    >
      <SheetHeader className="border-b border-gray-100 dark:border-gray-700">
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2" />
        <SheetTitle className="text-xl dark:text-gray-100">{medicine.name}</SheetTitle>
        <span className={`px-2 py-1 rounded-full text-xs self-start ${
          medicine.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {medicine.isActive ? 'Active' : 'Inactive'}
        </span>
      </SheetHeader>
      
      <SheetContent className="px-6 py-4 divide-y divide-gray-100 dark:divide-gray-700">
        <div className="grid grid-cols-2 gap-4 py-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dosage</p>
            <p className="font-medium dark:text-gray-200">{medicine.dosage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Frequency</p>
            <p className="font-medium dark:text-gray-200">{medicine.frequency}</p>
          </div>
        </div>
        
        {medicine.time && (
          <div className="py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
            <p className="font-medium dark:text-gray-200">{medicine.time}</p>
          </div>
        )}
        
        <div className="py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Added On</p>
          <p className="font-medium dark:text-gray-200">{formatDate(medicine.createdAt)}</p>
        </div>
      </SheetContent>
      
      <SheetFooter className="flex flex-col gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="primary"
            className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
            disabled={isActionLoading}
            onClick={() => onLogMedicine(medicine._id, medicine.name, 'taken')}
          >
            {isActionLoading ? 'Loading...' : 'Mark as Taken'}
          </Button>
          <Button
            variant="secondary"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700"
            disabled={isActionLoading}
            onClick={() => onLogMedicine(medicine._id, medicine.name, 'skipped')}
          >
            {isActionLoading ? 'Loading...' : 'Skip'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <Button
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            asChild
          >
            <Link to={`/edit-medicine/${medicine._id}`}>Edit</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            onClick={() => {
              onClose();
              setTimeout(() => onDelete(medicine._id), 300);
            }}
          >
            Delete
          </Button>
        </div>
      </SheetFooter>
    </Sheet>
  );
};

export default MedicineDetailSheet; 