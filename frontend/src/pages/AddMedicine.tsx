import { useState, FormEvent, ChangeEvent, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Link, useNavigate } from "react-router-dom"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { z } from "zod"

// Define validation schema with Zod
const MedicineSchema = z.object({
  name: z.string().min(2, { message: "Medicine name must be at least 2 characters" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  frequency: z.string().min(1, { message: "Please select a frequency" }),
  times: z.array(z.string().min(1, { message: "Time is required" })),
  notes: z.string().max(200, { message: "Notes cannot exceed 200 characters" }).optional(),
});

// Define medicine form data structure
interface MedicineFormData {
  name: string
  dosage: string
  frequency: string
  times: string[]
  notes: string
}

// Interface for validation errors
interface ValidationErrors {
  name?: string
  dosage?: string
  frequency?: string
  times?: string[]
  notes?: string
}

// Initial form state
const initialFormState: MedicineFormData = {
  name: "",
  dosage: "",
  frequency: "",
  times: [""],
  notes: ""
};

export default function AddMedicine() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  
  // Form state
  const [formData, setFormData] = useState<MedicineFormData>(initialFormState)

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setValidationErrors({});
    setError("");
  }, []);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    // If there are changes, ask for confirmation
    if (formData.name || formData.dosage || formData.frequency || formData.notes || 
        (formData.times.length > 1 || formData.times[0] !== "")) {
      if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
        navigate("/dashboard");
      }
    } else {
      // No changes, just navigate away
      navigate("/dashboard");
    }
  }, [formData, navigate]);

  // Validate a specific field
  const validateField = useCallback((field: keyof MedicineFormData, value: any) => {
    try {
      if (field === 'times') {
        // For times array, validate each time entry
        const result = z.array(z.string().min(1, { message: "Time is required" })).safeParse(value);
        if (!result.success) {
          return "All medication times are required";
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
  }, []);

  // Add or remove time inputs based on frequency selection
  const handleFrequencyChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
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
    
    // Validate the field and update errors
    const fieldError = validateField('frequency', frequency);
    setValidationErrors(prev => ({
      ...prev,
      frequency: fieldError
    }));
  }, [formData, validateField]);

  // Handle time input changes
  const handleTimeChange = useCallback((index: number, value: string) => {
    const updatedTimes = [...formData.times]
    updatedTimes[index] = value
    setFormData({ ...formData, times: updatedTimes })
    
    // Validate all times
    const fieldError = validateField('times', updatedTimes);
    setValidationErrors(prev => ({
      ...prev,
      times: fieldError ? [fieldError] : undefined
    }));
  }, [formData, validateField]);

  // Add another time input
  const addTimeInput = useCallback(() => {
    setFormData({ ...formData, times: [...formData.times, ""] })
  }, [formData]);

  // Remove a time input
  const removeTimeInput = useCallback((index: number) => {
    const updatedTimes = formData.times.filter((_, i) => i !== index)
    setFormData({ ...formData, times: updatedTimes })
    
    // Validate all times
    const fieldError = validateField('times', updatedTimes);
    setValidationErrors(prev => ({
      ...prev,
      times: fieldError ? [fieldError] : undefined
    }));
  }, [formData, validateField]);

  // Generic input change handler
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
    
    // Validate the field and update errors
    const fieldError = validateField(id as keyof MedicineFormData, value);
    setValidationErrors(prev => ({
      ...prev,
      [id]: fieldError
    }));
  }, [formData, validateField]);

  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Validate each field
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof MedicineFormData;
      const fieldError = validateField(field, value);
      if (fieldError) {
        errors[field] = fieldError;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  }, [formData, validateField]);

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
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
      setIsSubmitting(true)
      setError("")
      
      // Prepare data for API
      const medicineData = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times,
        notes: formData.notes,
        isActive: true
      }
      
      // Submit to API
      await apiService.post("/api/medicines", medicineData)
      
      // Show success toast notification with enhanced features
      success(`${formData.name} added to your medications`, {
        title: "Medicine Added Successfully!",
        duration: 4000
      })
      
      // Redirect to dashboard
      navigate("/dashboard", { 
        state: { message: `${formData.name} has been added to your medications` } 
      })
    } catch (err) {
      console.error("Error adding medicine:", err)
      setError("Failed to add medicine. Please try again.")
      
      // Show error toast with enhanced features
      toastError("Unable to add medication. Please try again.", {
        title: "Add Failed",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if user can add more time inputs
  const canAddMoreTimes = useCallback(() => {
    // For predefined frequencies, limit the number of times
    if (formData.frequency === "daily" && formData.times.length >= 3) return false;
    if (formData.frequency === "twice_daily" && formData.times.length >= 4) return false;
    if (formData.frequency === "three_times_daily" && formData.times.length >= 5) return false;
    if (formData.frequency === "weekly" && formData.times.length >= 3) return false;
    // For custom, allow more flexibility
    if (formData.frequency === "custom" && formData.times.length >= 8) return false;
    
    return true;
  }, [formData.frequency, formData.times.length]);

  // Format time for display
  const formatTimeLabel = useCallback((index: number) => {
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
  }, [formData.frequency]);

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex justify-center items-start min-h-[calc(100vh-12rem)]">
      <motion.div 
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-800 py-1 cursor-pointer transition-colors duration-200"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={16} className="mr-1" aria-hidden="true" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-6 text-center sm:text-left">Add New Medicine</h1>

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
              <div className="space-y-3 sm:space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Medication Times *
                </label>
                
                {formData.times.map((time, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex-grow space-y-1">
                      <label htmlFor={`time-${index}`} className="block text-xs text-gray-600">
                        {formatTimeLabel(index)}
                      </label>
                      <input
                        id={`time-${index}`}
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 
                        hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 
                        focus:outline-none shadow-sm transition-all duration-200 ease-in-out"
                        required
                        aria-describedby={validationErrors.times && validationErrors.times[0] ? `time-error-${index}` : undefined}
                        aria-invalid={!!(validationErrors.times && validationErrors.times[0])}
                      />
                      {validationErrors.times && validationErrors.times[0] && (
                        <p className="text-sm text-red-500 mt-1" id={`time-error-${index}`}>{validationErrors.times[0]}</p>
                      )}
                    </div>
                    
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeInput(index)}
                        className="text-red-500 hover:text-red-700 text-sm py-1.5 px-3 rounded-md hover:bg-red-50 mt-1 sm:mt-6 
                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label={`Remove ${formatTimeLabel(index)}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                {canAddMoreTimes() && (
                  <button
                    type="button"
                    onClick={addTimeInput}
                    className="text-violet-600 hover:text-violet-800 text-sm py-1.5 px-3 rounded-md bg-violet-50 
                    hover:bg-violet-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    aria-label="Add another time"
                  >
                    + Add another time
                  </button>
                )}
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
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
                <p className="text-sm text-red-500 mt-1" id="notes-error">{validationErrors.notes}</p>
              )}
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.notes.length}/200 characters
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6 py-2 font-medium text-sm transition-colors duration-200"
                aria-label="Cancel and return to dashboard"
              >
                Cancel
              </Button>
              
              <LoadingButton 
                type="submit" 
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 py-2 font-medium text-sm shadow transition-colors duration-200"
                isLoading={isSubmitting}
                loadingText="Adding..."
                aria-label="Add medicine"
              >
                Add Medicine
              </LoadingButton>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 