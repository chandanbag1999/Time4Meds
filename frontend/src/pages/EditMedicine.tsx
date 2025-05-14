import { useState, useEffect, Fragment } from "react"
import type { FormEvent, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Link, useParams, useNavigate } from "react-router-dom"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"
import { Spinner } from "@/components/ui/spinner"
import { FormSkeleton } from "@/components/ui/form-skeleton"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"

// Define validation schema with Zod
const MedicineSchema = z.object({
  name: z.string().min(2, { message: "Medicine name must be at least 2 characters" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  frequency: z.string().min(1, { message: "Please select a frequency" }),
  times: z.array(z.string().min(1, { message: "Time is required" })),
  notes: z.string().max(200, { message: "Notes cannot exceed 200 characters" }).optional(),
  isActive: z.boolean().optional(),
});

// Define medicine form data structure
interface MedicineFormData {
  name: string
  dosage: string
  frequency: string
  times: string[]
  notes: string
  isActive?: boolean
}

// Interface for validation errors
interface ValidationErrors {
  name?: string
  dosage?: string
  frequency?: string
  times?: (string | undefined)[]
  notes?: string
  isActive?: string
}

// Define a confirmation modal component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <AnimatePresence>
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-xl overflow-hidden border dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <LoadingButton
                type="button"
                isLoading={isLoading}
                loadingText="Deleting..."
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                {confirmText}
              </LoadingButton>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function EditMedicine() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error: toastError, warning } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  
  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    dosage: "",
    frequency: "",
    times: [""],
    notes: ""
  })
  
  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch medicine data on component mount
  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.get<any>(`/medicines/${id}`)
        
        // Handle different API response structures
        let medicineData;
        if (response && typeof response === 'object') {
          // If response has a data property, use that
          medicineData = response.data || response;
        } else {
          medicineData = response;
        }
        
        // Ensure times is always an array
        if (!medicineData.times || !Array.isArray(medicineData.times) || medicineData.times.length === 0) {
          medicineData.times = [""];
        }
        
        // Ensure isActive is properly initialized (default to true if not specified)
        medicineData.isActive = medicineData.isActive !== false;
        
        // Set form data with the medicine data
        setFormData(medicineData);
        
        // Clear any validation errors
        setValidationErrors({});
      } catch (err) {
        console.error("Error fetching medicine:", err)
        setError("Failed to load medicine data. Please try again.")
        toastError("Could not load medication details", {
          title: "Loading Failed",
          duration: 5000
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchMedicine()
    }
  }, [id, toastError])

  // Validate a specific field
  const validateField = (field: keyof MedicineFormData, value: any) => {
    try {
      if (field === 'times') {
        // For times array, validate each time entry
        const result = z.array(z.string().min(1, { message: "Time is required" })).safeParse(value);
        if (!result.success) {
          return "All medication times are required";
        }
        return undefined;
      } else if (field === 'isActive') {
        // isActive is optional, no validation needed
        return undefined;
      } else if (field === 'notes') {
        // Notes is optional, but has max length
        if (value && value.length > 200) {
          return "Notes cannot exceed 200 characters";
        }
        return undefined;
      } else {
        // For other fields, extract the schema for just that field
        const fieldSchema = MedicineSchema.shape[field];
        fieldSchema.parse(value);
        return undefined;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message;
        return fieldError;
      }
      return "Invalid input";
    }
  };

  // Generic input change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
    setHasUnsavedChanges(true)
  }

  // Handle field blur for validation
  const handleBlur = (field: keyof MedicineFormData | string, value: any) => {
    // Handle time inputs (time-0, time-1, etc.)
    if (field.startsWith('time-')) {
      const index = parseInt(field.split('-')[1]);
      if (!isNaN(index) && index >= 0 && index < formData.times.length) {
        // Check if this specific time is empty
        const timeError = value.trim() === '' ? "Time is required" : undefined;
        
        // Update validation errors for this specific time
        setValidationErrors(prev => {
          const timeErrors = Array.isArray(prev.times) ? [...prev.times] : [];
          timeErrors[index] = timeError;
          return {
            ...prev,
            times: timeErrors.some(e => e !== undefined) ? timeErrors : undefined
          };
        });
        return;
      }
    }
    
    // For regular fields
    if (Object.keys(formData).includes(field as string)) {
      const fieldError = validateField(field as keyof MedicineFormData, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
  }

  // Handle checkbox change
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    setFormData({ ...formData, [id]: checked })
    setHasUnsavedChanges(true)
  }

  // Add or remove time inputs based on frequency selection
  const handleFrequencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const frequency = e.target.value
    let times: string[] = []
    
    // Set default number of time inputs based on frequency
    if (frequency === "daily") {
      times = ["08:00"] // Default morning time
    } else if (frequency === "twice_daily") {
      times = ["08:00", "20:00"] // Morning and evening
    } else if (frequency === "three_times_daily") {
      times = ["08:00", "14:00", "20:00"] // Morning, afternoon, evening
    } else if (frequency === "weekly") {
      times = ["08:00"] // Default time on selected day
    } else if (frequency === "custom") {
      times = [""] // Empty for custom input
    } else {
      times = [""] // Default fallback
    }
    
    setFormData({ ...formData, frequency, times })
    setHasUnsavedChanges(true)
    
    // Validate the field on change since it affects other fields
    const fieldError = validateField('frequency', frequency);
    setValidationErrors(prev => ({
      ...prev,
      frequency: fieldError,
      // Clear times errors when frequency changes
      times: undefined
    }));
  }

  // Handle time input changes
  const handleTimeChange = (index: number, value: string) => {
    const updatedTimes = [...formData.times]
    updatedTimes[index] = value
    setFormData({ ...formData, times: updatedTimes })
    setHasUnsavedChanges(true)
  }

  // Add another time input
  const addTimeInput = () => {
    setFormData({ ...formData, times: [...formData.times, ""] })
    setHasUnsavedChanges(true)
  }

  // Remove a time input
  const removeTimeInput = (index: number) => {
    const updatedTimes = formData.times.filter((_, i) => i !== index)
    setFormData({ ...formData, times: updatedTimes })
    setHasUnsavedChanges(true)
    
    // Validate all times
    const fieldError = validateField('times', updatedTimes);
    setValidationErrors(prev => ({
      ...prev,
      times: fieldError ? [fieldError] : undefined
    }));
  }

  // Handle cancel button click
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/dashboard")
      }
    } else {
      navigate("/dashboard")
    }
  }

  // Validate the entire form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Validate each field
    // Name
    const nameError = validateField('name', formData.name);
    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }
    
    // Dosage
    const dosageError = validateField('dosage', formData.dosage);
    if (dosageError) {
      errors.dosage = dosageError;
      isValid = false;
    }
    
    // Frequency
    const frequencyError = validateField('frequency', formData.frequency);
    if (frequencyError) {
      errors.frequency = frequencyError;
      isValid = false;
    }
    
    // Times - check each time individually
    const timesErrors: string[] = [];
    let hasTimeError = false;
    
    formData.times.forEach((time, index) => {
      if (!time || time.trim() === '') {
        timesErrors[index] = "Time is required";
        hasTimeError = true;
      }
    });
    
    if (hasTimeError) {
      errors.times = timesErrors;
      isValid = false;
    }
    
    // Notes (optional)
    if (formData.notes && formData.notes.length > 200) {
      errors.notes = "Notes cannot exceed 200 characters";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      // Show validation error toast
      toastError("Please correct all validation errors.", {
        title: "Validation Error",
        duration: 4000
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      // Prepare data for submission
      const medicineData = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times.filter(time => time.trim() !== ''), // Remove empty times
        notes: formData.notes,
        isActive: formData.isActive !== false // Default to true if undefined
      };
      
      // Submit update to API
      await apiService.put(`/medicines/${id}`, medicineData);
      
      // Show success toast notification
      success(`${formData.name} has been updated`, {
        title: "Medicine Updated Successfully!",
        duration: 4000
      });
      
      // Redirect to dashboard
      navigate("/dashboard", { 
        state: { message: `${formData.name} has been updated successfully` } 
      });
    } catch (err) {
      console.error("Error updating medicine:", err);
      setError("Failed to update medicine. Please try again.");
      
      toastError("Unable to update medication. Please try again.", {
        title: "Update Failed",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle medicine deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await apiService.delete(`/medicines/${id}`)
      
      // Close the modal
      setIsDeleteModalOpen(false)
      
      // Show success toast notification
      warning(`${formData.name} has been deleted`, {
        title: "Medicine Deleted",
        duration: 4000
      })
      
      // Redirect to dashboard
      navigate("/dashboard", {
        state: { message: `${formData.name} has been removed from your medications` }
      })
    } catch (err) {
      console.error("Error deleting medicine:", err)
      
      // Close the modal
      setIsDeleteModalOpen(false)
      
      // Show error toast
      toastError("Unable to delete medication. Please try again.", {
        title: "Delete Failed",
        duration: 5000
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Determine if user can add more time inputs
  const canAddMoreTimes = () => {
    // For predefined frequencies, limit the number of times
    if (formData.frequency === "daily" && formData.times.length >= 3) return false;
    if (formData.frequency === "twice_daily" && formData.times.length >= 4) return false;
    if (formData.frequency === "three_times_daily" && formData.times.length >= 5) return false;
    if (formData.frequency === "weekly" && formData.times.length >= 3) return false;
    // For custom, allow more flexibility
    if (formData.frequency === "custom" && formData.times.length >= 8) return false;
    
    return true;
  }

  // Format time for display
  const formatTimeLabel = (index: number) => {
    if (formData.frequency === "daily" || formData.frequency === "weekly") {
      return index === 0 ? "Primary time" : `Additional time ${index}`;
    }
    if (formData.frequency === "twice_daily") {
      return index === 0 ? "Morning time" : index === 1 ? "Evening time" : `Additional time ${index-1}`;
    }
    if (formData.frequency === "three_times_daily") {
      if (index === 0) return "Morning time";
      if (index === 1) return "Afternoon time";
      if (index === 2) return "Evening time";
      return `Additional time ${index-2}`;
    }
    return `Time ${index + 1}`;
  }

  // Return the component UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 flex justify-center items-start min-h-screen">
        <motion.div 
          className="w-full max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-800 py-1.5 px-2 -ml-2 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer transition-all duration-200 group"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={16} className="mr-1.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-6 text-center sm:text-left">Edit Medicine</h1>
          
          <div className="w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 sm:p-8 mt-4 mb-10 border border-gray-100 dark:border-gray-700">
            <FormSkeleton 
              title="Loading Medicine Details" 
              fields={5}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 flex justify-center items-start min-h-screen">
      <motion.div 
        className="w-full max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-800 py-1.5 px-2 -ml-2 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer transition-all duration-200 group"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={16} className="mr-1.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-6 text-center sm:text-left">Edit Medicine</h1>

        <div className="w-full bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl p-6 sm:p-8 mt-4 mb-10 border dark:border-gray-700">
          {error && (
            <div 
              className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800"
              role="alert"
            >
              {error}
            </div>
          )}
          
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Medicine Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 
                placeholder:text-gray-400 hover:border-violet-400 focus:border-violet-500 focus:ring-2 
                focus:ring-violet-500 focus:outline-none shadow-sm transition-all duration-200 ease-in-out
                dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-500 dark:focus:ring-indigo-500 
                dark:focus:border-indigo-500 dark:text-gray-100 dark:hover:border-indigo-400"
                placeholder="e.g., Aspirin"
                required
                aria-describedby={validationErrors.name ? "name-error" : undefined}
                aria-invalid={!!validationErrors.name}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500 mt-1" id="name-error">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dosage *
              </label>
              <input
                id="dosage"
                name="dosage"
                type="text"
                value={formData.dosage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 
                placeholder:text-gray-400 hover:border-violet-400 focus:border-violet-500 focus:ring-2 
                focus:ring-violet-500 focus:outline-none shadow-sm transition-all duration-200 ease-in-out
                dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-500 dark:focus:ring-indigo-500 
                dark:focus:border-indigo-500 dark:text-gray-100 dark:hover:border-indigo-400"
                placeholder="e.g., 100mg"
                required
                aria-describedby={validationErrors.dosage ? "dosage-error" : undefined}
                aria-invalid={!!validationErrors.dosage}
              />
              {validationErrors.dosage && (
                <p className="text-sm text-red-500 mt-1" id="dosage-error">{validationErrors.dosage}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Frequency *
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleFrequencyChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 
                hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 
                focus:outline-none shadow-sm transition-all duration-200 ease-in-out appearance-none bg-no-repeat
                dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-indigo-500 
                dark:focus:border-indigo-500 dark:hover:border-indigo-400"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M8%2010.94L3.53%206.47l.94-.94L8%209.06l3.53-3.53.94.94z%22%2F%3E%3C%2Fsvg%3E')", paddingRight: "2.5rem", backgroundPosition: "right 1rem center", backgroundSize: "1em" }}
                required
                aria-describedby={validationErrors.frequency ? "frequency-error" : undefined}
                aria-invalid={!!validationErrors.frequency}
              >
                <option value="">Select frequency</option>
                <option value="daily">Once daily</option>
                <option value="twice_daily">Twice daily</option>
                <option value="three_times_daily">Three times daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              {validationErrors.frequency && (
                <p className="text-sm text-red-500 mt-1" id="frequency-error">{validationErrors.frequency}</p>
              )}
            </div>

            {formData.frequency && (
              <motion.div 
                className="space-y-3 sm:space-y-4 pt-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medication Times *
                </label>
                
                {formData.times.map((time, index) => (
                  <motion.div 
                    key={index} 
                    className="flex flex-col sm:flex-row gap-2 sm:items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex-grow space-y-1.5">
                      <label htmlFor={`time-${index}`} className="block text-xs text-gray-600 dark:text-gray-400">
                        {formatTimeLabel(index)}
                      </label>
                      <div className="relative">
                        <input
                          id={`time-${index}`}
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          onBlur={(e) => handleBlur(`time-${index}`, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
                          hover:border-violet-400 dark:hover:border-violet-500 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 
                          focus:ring-violet-500/20 dark:focus:ring-violet-400/30 focus:outline-none shadow-sm transition-all duration-200 ease-in-out"
                          required
                          aria-describedby={validationErrors.times && validationErrors.times[index] ? `time-error-${index}` : undefined}
                          aria-invalid={!!(validationErrors.times && validationErrors.times[index])}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      {validationErrors.times && validationErrors.times[index] && (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-1.5" id={`time-error-${index}`}>{validationErrors.times[index]}</p>
                      )}
                    </div>
                    
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeInput(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 mt-1 sm:mt-0
                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 flex items-center"
                        aria-label={`Remove ${formatTimeLabel(index)}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </motion.div>
                ))}
                
                {canAddMoreTimes() && (
                  <motion.button
                    type="button"
                    onClick={addTimeInput}
                    className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 text-sm py-2 px-4 rounded-xl bg-violet-50 dark:bg-violet-900/30
                    hover:bg-violet-100 dark:hover:bg-violet-800/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 mt-2
                    flex items-center shadow-sm"
                    aria-label="Add another time"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add another time
                  </motion.button>
                )}
              </motion.div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes (Optional)
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400" id="notes-counter">
                  {formData.notes?.length || 0}/200
                </span>
              </div>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 
                placeholder:text-gray-400 hover:border-violet-400 focus:border-violet-500 focus:ring-2 
                focus:ring-violet-500 focus:outline-none shadow-sm transition-all duration-200 ease-in-out h-24 resize-y
                dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-500 dark:focus:ring-indigo-500 
                dark:focus:border-indigo-500 dark:text-gray-100 dark:hover:border-indigo-400"
                placeholder="Any additional information or instructions..."
                aria-describedby={validationErrors.notes ? "notes-error" : undefined}
                aria-invalid={!!validationErrors.notes}
              />
              {validationErrors.notes && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1.5" id="notes-error">{validationErrors.notes}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded
                  dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-indigo-500"
                />
                <label htmlFor="isActive" className="ml-2.5 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none" id="isActive-description">
                  Active Medicine
                </label>
              </div>
              {validationErrors.isActive && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">{validationErrors.isActive}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-5 mt-2 border-t border-gray-100 dark:border-gray-700">
              <LoadingButton
                type="button"
                variant="outline"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl px-6 py-2.5 font-medium text-sm transition-colors duration-200 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-500/30 focus:outline-none shadow-sm"
                onClick={() => setIsDeleteModalOpen(true)}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete Medicine
              </LoadingButton>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-6 py-2.5 font-medium text-sm transition-colors duration-200 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-500/30 focus:outline-none shadow-sm"
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 py-2.5 font-medium text-sm shadow-sm hover:shadow transition-all duration-200 focus:ring-2 focus:ring-violet-500/30 focus:outline-none"
                >
                  Save Changes
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Confirm Medicine Deletion"
          message={`Are you sure you want to delete ${formData.name}? This action cannot be undone.`}
          confirmText="Delete Medicine"
          cancelText="Cancel"
          isLoading={isDeleting}
        />
      )}
    </div>
  )
} 