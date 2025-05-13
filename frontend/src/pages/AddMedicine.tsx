import { useState, FormEvent, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Link, useNavigate } from "react-router-dom"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"

// Define medicine form data structure
interface MedicineFormData {
  name: string
  dosage: string
  frequency: string
  times: string[]
  notes: string
}

export default function AddMedicine() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    dosage: "",
    frequency: "",
    times: [""],
    notes: ""
  })

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
  }

  // Handle time input changes
  const handleTimeChange = (index: number, value: string) => {
    const updatedTimes = [...formData.times]
    updatedTimes[index] = value
    setFormData({ ...formData, times: updatedTimes })
  }

  // Add another time input
  const addTimeInput = () => {
    setFormData({ ...formData, times: [...formData.times, ""] })
  }

  // Remove a time input
  const removeTimeInput = (index: number) => {
    const updatedTimes = formData.times.filter((_, i) => i !== index)
    setFormData({ ...formData, times: updatedTimes })
  }

  // Generic input change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.dosage || !formData.frequency) {
      setError("Please fill in all required fields")
      return
    }
    
    if (formData.times.some(time => !time)) {
      setError("Please specify all medication times")
      return
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
        title: "Medicine Added",
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

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-xl sm:max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">Add New Medicine</h1>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Medicine Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Aspirin"
              required
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">
              Dosage *
            </label>
            <input
              id="dosage"
              type="text"
              value={formData.dosage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 100mg"
              required
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
              Frequency *
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={handleFrequencyChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select frequency</option>
              <option value="daily">Once daily</option>
              <option value="twice_daily">Twice daily</option>
              <option value="three_times_daily">Three times daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeInput(index)}
                      className="text-red-600 hover:text-red-800 text-sm py-1 px-2 border border-transparent rounded hover:bg-red-50 mt-1 sm:mt-6"
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
                  className="text-blue-600 hover:text-blue-800 text-sm py-1 px-2 border border-blue-200 rounded hover:bg-blue-50"
                >
                  + Add another time
                </button>
              )}
            </div>
          )}

          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
              placeholder="Any additional information or instructions..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto flex-grow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Medicine"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 