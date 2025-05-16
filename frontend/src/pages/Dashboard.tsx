import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button-modern"
import { LoadingButton } from "@/components/ui/loading-button"
import { Container } from "@/components/ui/container"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import MedicineDetailSheet from "@/components/MedicineDetailSheet"
import { format } from "date-fns"

interface Medicine {
  _id: string
  name: string
  dosage: string
  frequency: string
  time?: string
  isActive: boolean
  createdAt: string
}

interface ReminderLog {
  id: string
  medicineId: string
  medicineName: string
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  date: string
  time?: string
}

// New interface for activity logs
interface ActivityLog {
  _id: string
  medicineId: {
    _id: string
    name: string
    dosage: string
  }
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  timestamp: string
  time: string
}

// Sample medication data for development/fallback
const SAMPLE_MEDICINES: Medicine[] = [
  { _id: "1", name: "Aspirin", dosage: "100mg", frequency: "Once daily", time: "08:00 AM", isActive: true, createdAt: new Date().toISOString() },
  { _id: "2", name: "Amoxicillin", dosage: "250mg", frequency: "Three times daily", time: "Every 8 hours", isActive: true, createdAt: new Date().toISOString() },
  { _id: "3", name: "Vitamin D", dosage: "1000 IU", frequency: "Once daily", time: "Morning", isActive: true, createdAt: new Date().toISOString() }
]

// Sample reminder logs for development/fallback
const generateSampleReminders = (): ReminderLog[] => {
  const today = new Date()
  return [
    { 
      id: "1", 
      medicineId: "1", 
      medicineName: "Aspirin", 
      status: "pending", 
      date: today.toISOString(), 
      time: "08:00" 
    },
    { 
      id: "2", 
      medicineId: "2", 
      medicineName: "Amoxicillin", 
      status: "taken", 
      date: today.toISOString(), 
      time: "09:00" 
    },
    { 
      id: "3", 
      medicineId: "3", 
      medicineName: "Vitamin D", 
      status: "missed", 
      date: today.toISOString(), 
      time: "07:00" 
    },
    { 
      id: "4", 
      medicineId: "2", 
      medicineName: "Amoxicillin", 
      status: "pending", 
      date: today.toISOString(), 
      time: "17:00" 
    }
  ]
}

export default function Dashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [todayReminders, setTodayReminders] = useState<ReminderLog[]>([])
  const [loading, setLoading] = useState(true)
  const [remindersLoading, setRemindersLoading] = useState(true)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [activityLogsLoading, setActivityLogsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [usingSampleData, setUsingSampleData] = useState(false)
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  // State for the medicine detail sheet
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)

  // Animation variants for consistent animations across sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Animation variants for children elements with stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Check if there's a message in the location state
    if (location.state && location.state.message) {
      toast(location.state.message, "success")
      
      // If message is about adding a medicine, refresh the medicines list
      if (location.state.message.includes('has been added') || 
          location.state.message.includes('added to your medications')) {
        refreshMedicines()
      }
      
      // Clear the location state to prevent showing the toast again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state, toast])

  useEffect(() => {
    refreshMedicines()
  }, [])

  // Function to fetch medicines data
  const refreshMedicines = async () => {
    try {
      setLoading(true)
      const data = await apiService.get<Medicine[]>("/medicines")
      setMedicines(Array.isArray(data) ? data : [])
      
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      // Only try to parse if userString is not null or undefined
      if (userString && userString !== "undefined" && userString !== "null") {
        try {
          const user = JSON.parse(userString)
          setUserName(user?.name || "")
        } catch (parseError) {
          console.error("Error parsing user data:", parseError)
          // Clear invalid data
          localStorage.removeItem("user")
        }
      } else if (userString) {
        // Clear invalid values
        localStorage.removeItem("user")
      }
    } catch (err) {
      console.error("Error fetching medicines:", err)
      // Use sample data when API is not available
      setMedicines(SAMPLE_MEDICINES)
      setUsingSampleData(true)
    } finally {
      setLoading(false)
    }
  }

  // Fetch today's reminders
  useEffect(() => {
    const fetchTodayReminders = async () => {
      try {
        setRemindersLoading(true);
        
        // Format today's date in YYYY-MM-DD format for the API
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        
        // Get reminders for today only
        const response = await apiService.get<any>(`/reminders/log?date=${formattedDate}`);
        
        // Check response structure and extract logs
        let reminderLogs: ReminderLog[] = [];
        
        if (response && typeof response === 'object') {
          // Handle different API response structures
          if (response.success && response.data) {
            // Standard API response format
            if (response.data.logs && Array.isArray(response.data.logs)) {
              reminderLogs = response.data.logs.map((log: any) => ({
                id: log._id || log.id,
                medicineId: log.medicineId?._id || log.medicineId,
                medicineName: log.medicineId?.name || "Unknown Medicine",
                status: log.status || "pending",
                date: log.timestamp || log.date,
                time: log.time
              }));
            }
          } else if (Array.isArray(response)) {
            // Direct array response
            reminderLogs = response.map((log: any) => ({
              id: log._id || log.id,
              medicineId: log.medicineId?._id || log.medicineId,
              medicineName: log.medicineId?.name || "Unknown Medicine",
              status: log.status || "pending",
              date: log.timestamp || log.date,
              time: log.time
            }));
          } else if (response.data) {
            // API response with data field
            if (Array.isArray(response.data)) {
              reminderLogs = response.data.map((log: any) => ({
                id: log._id || log.id,
                medicineId: log.medicineId?._id || log.medicineId,
                medicineName: log.medicineId?.name || "Unknown Medicine",
                status: log.status || "pending",
                date: log.timestamp || log.date,
                time: log.time
              }));
            } else if (response.data.logs && Array.isArray(response.data.logs)) {
              reminderLogs = response.data.logs.map((log: any) => ({
                id: log._id || log.id,
                medicineId: log.medicineId?._id || log.medicineId,
                medicineName: log.medicineId?.name || "Unknown Medicine",
                status: log.status || "pending",
                date: log.timestamp || log.date,
                time: log.time
              }));
            }
          }
        }
        
        console.log("Today's reminders:", reminderLogs);
        setTodayReminders(reminderLogs);
      } catch (err) {
        console.error("Error fetching today's reminders:", err);
        // Use sample data if API fails
        if (usingSampleData) {
          setTodayReminders(generateSampleReminders());
        } else {
          // Ensure todayReminders is always an array
          setTodayReminders([]);
        }
      } finally {
        setRemindersLoading(false);
      }
    };

    fetchTodayReminders();
    
    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchTodayReminders();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [usingSampleData]);

  // Fetch recent activity logs
  useEffect(() => {
    const fetchRecentActivityLogs = async () => {
      try {
        setActivityLogsLoading(true);
        
        // Limit to 5 most recent logs
        const response = await apiService.get<any>('/reminder-logs?limit=5');
        
        let logs: ActivityLog[] = [];
        
        if (response && typeof response === 'object') {
          if (response.success && response.data && response.data.logs) {
            logs = response.data.logs;
          } else if (Array.isArray(response)) {
            logs = response;
          } else if (response.data && Array.isArray(response.data)) {
            logs = response.data;
          } else if (response.data && response.data.logs && Array.isArray(response.data.logs)) {
            logs = response.data.logs;
          }
        }
        
        console.log("Recent activity logs:", logs);
        setActivityLogs(logs);
      } catch (err) {
        console.error("Error fetching recent activity logs:", err);
        // Use sample data if API fails
        if (usingSampleData) {
          // Mock activity logs if API fails
          const sampleActivityLogs = generateSampleReminders().map(log => ({
            _id: log.id,
            medicineId: {
              _id: log.medicineId,
              name: log.medicineName,
              dosage: "100mg"
            },
            status: log.status,
            timestamp: log.date,
            time: log.time || ""
          }));
          setActivityLogs(sampleActivityLogs);
        } else {
          setActivityLogs([]);
        }
      } finally {
        setActivityLogsLoading(false);
      }
    };

    fetchRecentActivityLogs();
    
    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchRecentActivityLogs();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [usingSampleData]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        if (!usingSampleData) {
          await apiService.delete(`/medicines/${id}`)
        }
        setMedicines(medicines.filter(med => med._id !== id))
        toast("Medicine deleted successfully", "success")
      } catch (err) {
        console.error("Error deleting medicine:", err)
        toast("Failed to delete medicine", "error")
      }
    }
  }

  // Log medicine status (taken or skipped)
  const logMedicineStatus = async (medicineId: string, medicineName: string, status: 'taken' | 'skipped') => {
    // Mark this specific medicine as loading
    setActionsLoading(prev => ({ ...prev, [medicineId]: true }));
    
    try {
      const currentTime = new Date().toISOString();
      const logData = {
        medicineId,
        status,
        date: currentTime,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      
      if (!usingSampleData) {
        await apiService.post('/reminders/log', logData);
        
        // Refresh the reminders list after logging
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        const response = await apiService.get<any>(`/reminders/log?date=${formattedDate}`);
        
        // Process the updated reminders to ensure they're in the correct format
        let updatedReminders: ReminderLog[] = [];
        
        if (response && typeof response === 'object') {
          // Handle different API response structures
          if (response.success && response.data) {
            if (response.data.logs && Array.isArray(response.data.logs)) {
              updatedReminders = response.data.logs.map((log: any) => ({
                id: log._id || log.id,
                medicineId: log.medicineId?._id || log.medicineId,
                medicineName: log.medicineId?.name || "Unknown Medicine",
                status: log.status || "pending",
                date: log.timestamp || log.date,
                time: log.time
              }));
            }
          } else if (Array.isArray(response)) {
            updatedReminders = response.map((log: any) => ({
              id: log._id || log.id,
              medicineId: log.medicineId?._id || log.medicineId,
              medicineName: log.medicineId?.name || "Unknown Medicine",
              status: log.status || "pending",
              date: log.timestamp || log.date,
              time: log.time
            }));
          } else if (response.data) {
            if (Array.isArray(response.data)) {
              updatedReminders = response.data.map((log: any) => ({
                id: log._id || log.id,
                medicineId: log.medicineId?._id || log.medicineId,
                medicineName: log.medicineId?.name || "Unknown Medicine",
                status: log.status || "pending",
                date: log.timestamp || log.date,
                time: log.time
              }));
            } else if (response.data.logs && Array.isArray(response.data.logs)) {
              updatedReminders = response.data.logs.map((log: any) => ({
                id: log._id || log.id,
                medicineId: log.medicineId?._id || log.medicineId,
                medicineName: log.medicineId?.name || "Unknown Medicine",
                status: log.status || "pending",
                date: log.timestamp || log.date,
                time: log.time
              }));
            }
          }
          
          setTodayReminders(updatedReminders);
        }
      } else {
        // Update local state for sample data
        const updatedReminders = todayReminders.map(reminder => {
          if (reminder.medicineId === medicineId && reminder.status === 'pending') {
            return { ...reminder, status };
          }
          return reminder;
        });
        setTodayReminders(updatedReminders);
      }
      
      const statusText = status === 'taken' ? 'taken' : 'skipped';
      toast(`${medicineName} marked as ${statusText}`, 'success');
    } catch (err) {
      console.error(`Error logging medicine as ${status}:`, err);
      toast(`Failed to log medicine status`, 'error');
    } finally {
      // Remove loading state for this medicine
      setActionsLoading(prev => ({ ...prev, [medicineId]: false }));
    }
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    
    // If time is already in HH:MM format, convert to 12-hour format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const hour12 = hours % 12 || 12
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
    }
    
    // If it's an ISO date string
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
    
    return timeString
  }

  // Get appropriate status badge with color
  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:from-primary/20 dark:to-accent/20 dark:text-primary border border-primary/20 dark:border-primary/30",
      taken: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30",
      missed: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/30",
      skipped: "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
    }
    
    return (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full shadow-sm ${statusClasses[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Open medicine detail sheet
  const openMedicineDetail = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailSheetOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/login')
    toast("Logged out successfully", "success")
  }

  // Verify navigation functions
  const navigateToAddMedicine = () => {
    navigate('/add-medicine')
  }

  const navigateToReminderLogs = () => {
    navigate('/reminder-logs')
  }

  const navigateToLogs = () => {
    navigate("/logs")
  }

  // Function to format timestamp to human-readable date/time
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return timestamp;
    }
  }

  return (
    <Container size="2xl" className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 max-w-full md:max-w-7xl mx-auto">
      {/* Header Section with Welcome Message - IMPROVED */}
      <motion.div 
        className="relative mb-6 sm:mb-8 md:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10"></div>
        <div className="relative px-4 py-5 sm:px-6 md:px-8 lg:px-10 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 mobile-text-gradient tracking-tight">
                Welcome{userName || user?.name ? `, ${userName || user?.name}` : ""}!
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                Manage your medications and keep track of your health journey with Time4Meds. We'll help you stay on schedule.
              </p>
            </div>
          </div>
          
          {/* Quick Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="glass-card p-3 sm:p-4 dark:bg-gray-700/60" variants={itemVariants}>
              <div className="flex items-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-3 shadow-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">On Track</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {todayReminders.filter(r => r.status === 'taken').length} Medications
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="glass-card p-3 sm:p-4 dark:bg-gray-700/60" variants={itemVariants}>
              <div className="flex items-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mr-3 shadow-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {todayReminders.filter(r => r.status === 'pending').length} Medications
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="glass-card p-3 sm:p-4 sm:col-span-2 lg:col-span-1 dark:bg-gray-700/60" variants={itemVariants}>
              <div className="flex items-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary mr-3 shadow-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {medicines.length} Medications
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Today's Reminders Section - IMPROVED */}
      <motion.div 
        className="mb-6 sm:mb-8 md:mb-12 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 dark:from-primary/10 dark:via-secondary/10 dark:to-primary/10 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Today's Reminders
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              href="/reminder-logs"
              asChild
              className="w-full sm:w-auto text-sm hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary transition-all"
              onClick={(e) => {
                e.preventDefault();
                navigateToReminderLogs();
              }}
            >
              <Link to="/reminder-logs" className="flex items-center">
                <span>View All Reminders</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 py-5 sm:py-6">
          {remindersLoading ? (
            isMobile ? (
              <div className="space-y-3 sm:space-y-4">
                <CardSkeleton count={3} />
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700">
                <TableSkeleton columns={4} rows={3} />
              </div>
            )
          ) : todayReminders.length === 0 ? (
            <motion.div 
              className="text-center py-8 sm:py-10 md:py-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50/50 to-primary/5 dark:from-gray-800/80 dark:to-primary/20 border border-dashed border-gray-200 dark:border-gray-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="max-w-md mx-auto">
                <motion.div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary/70 dark:text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <motion.p 
                  className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-1 sm:mb-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  All caught up!
                </motion.p>
                <motion.p 
                  className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-5 sm:mb-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  No reminders scheduled for today. Take care of yourself and enjoy your day.
                </motion.p>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    href="/add-medicine"
                    asChild
                    className="hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary border-primary/10 dark:border-primary/30"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToAddMedicine();
                    }}
                  >
                    <Link to="/add-medicine" className="flex items-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm sm:text-base">Add New Medicine</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : isMobile ? (
            // Mobile view
            <motion.div 
              className="space-y-3 sm:space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {todayReminders.map((reminder) => (
                <motion.div 
                  key={reminder.id} 
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/70 shadow-sm hover:shadow-md transition-all"
                  variants={itemVariants}
                  whileHover={{ y: -2, boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)" }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100">{reminder.medicineName}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(reminder.time || reminder.date)}
                      </div>
                    </div>
                    {getStatusBadge(reminder.status)}
                  </div>
                  
                  {reminder.status === 'pending' && (
                    <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                      <LoadingButton
                        variant="primary"
                        size="sm"
                        className="flex-1 mobile-gradient-secondary rounded-lg sm:rounded-xl font-medium shadow-sm text-xs sm:text-sm"
                        onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'taken')}
                        isLoading={actionsLoading[reminder.medicineId]}
                        loadingText="Taking..."
                      >
                        Take Now
                      </LoadingButton>
                      <LoadingButton
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg sm:rounded-xl font-medium shadow-sm text-xs sm:text-sm"
                        onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'skipped')}
                        isLoading={actionsLoading[reminder.medicineId]}
                        loadingText="Skipping..."
                      >
                        Skip
                      </LoadingButton>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Desktop view
            <motion.div 
              className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <TableHead className="font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-300">Medicine</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-300">Time</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {todayReminders.map((reminder) => (
                    <motion.tr 
                      key={reminder.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      variants={itemVariants}
                    >
                      <TableCell className="font-medium text-sm text-gray-800 dark:text-gray-200">{reminder.medicineName}</TableCell>
                      <TableCell className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(reminder.time || reminder.date)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                      <TableCell className="text-right">
                        {reminder.status === 'pending' ? (
                          <div className="flex justify-end gap-1.5 sm:gap-2">
                            <LoadingButton
                              variant="primary"
                              size="sm"
                              className="mobile-gradient-secondary rounded-lg shadow-sm text-xs sm:text-sm py-1 px-2 sm:px-3"
                              onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'taken')}
                              isLoading={actionsLoading[reminder.medicineId]}
                              loadingText="Taking..."
                            >
                              Take Now
                            </LoadingButton>
                            <LoadingButton
                              variant="secondary"
                              size="sm"
                              className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg shadow-sm text-xs sm:text-sm py-1 px-2 sm:px-3"
                              onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'skipped')}
                              isLoading={actionsLoading[reminder.medicineId]}
                              loadingText="Skipping..."
                            >
                              Skip
                            </LoadingButton>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {reminder.status === 'taken' ? 'Taken' : 
                            reminder.status === 'missed' ? 'Missed' : 'Skipped'}
                          </span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </Table>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Your Medications Section */}
      <motion.div 
        className="mb-6 sm:mb-8 md:mb-12"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent dark:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            Your Medications
          </h2>
          <Button 
            variant="primary" 
            size="md"
            href="/add-medicine"
            asChild
            className="mobile-gradient-primary text-sm sm:text-base rounded-full shadow-md"
            onClick={(e) => {
              e.preventDefault();
              navigateToAddMedicine();
            }}
          >
            <Link to="/add-medicine" className="flex items-center px-3 sm:px-4">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V19M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add Medicine
            </Link>
          </Button>
        </div>
      
        {usingSampleData && (
          <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200 p-3 sm:p-4 text-sm sm:text-base text-amber-700">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong className="font-semibold">Using sample data.</strong> Backend server is not running or not accessible.
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            <CardSkeleton count={6} />
          </div>
        ) : medicines.length === 0 ? (
          <motion.div 
            className="overflow-hidden rounded-xl sm:rounded-3xl shadow-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mobile-animate-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              {/* Decorative top gradient */}
              <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10"></div>
              
              {/* Content */}
              <div className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 flex flex-col items-center text-center">
                {/* Pill icon in circular container */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center mb-4 sm:mb-6 shadow-sm">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20"
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-accent dark:text-accent sm:w-8 sm:h-8"
                    >
                      <path d="m12 22 4-4" />
                      <path d="M8 18H6a2 2 0 0 1-2-2v-2" />
                      <path d="M18 8V6a2 2 0 0 0-2-2h-2" />
                      <path d="m12 2-4 4" />
                      <path d="M19 13.5v-1a2.5 2.5 0 0 0-2.5-2.5h-1" />
                      <path d="M5 10.5v1a2.5 2.5 0 0 0 2.5 2.5h1" />
                      <path d="m16 16-3.5-3.5" />
                      <path d="m8 8 3.5 3.5" />
                    </svg>
                  </div>
                </div>
                
                {/* Text */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3">No medications yet</h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mb-6 sm:mb-8">
                  Add your medications to get reminders and keep track of your health journey. Never miss a dose again!
                </p>
                
                {/* Button */}
                <Button 
                  variant="primary"
                  size="lg"
                  href="/add-medicine"
                  asChild
                  className="mobile-gradient-primary py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-md transition-all transform hover:scale-105 text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToAddMedicine();
                  }}
                >
                  <Link to="/add-medicine" className="flex items-center mx-auto">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5V19M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Add Your First Medicine
                  </Link>
                </Button>
                
                {/* Helpful note */}
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  You can add multiple medications and customize reminder schedules
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {medicines.map((medicine) => (
              <motion.div 
                key={medicine._id} 
                className="glass-card p-0 h-full cursor-pointer overflow-hidden mobile-card-shadow transition-all hover:shadow-lg dark:bg-gray-700/60"
                onClick={() => openMedicineDetail(medicine)}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 sm:p-4 md:p-5 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100">{medicine.name}</h3>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      medicine.isActive 
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50'
                    }`}>
                      {medicine.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 flex-grow">
                    <div className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-16 sm:w-20 flex items-center">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Dosage:
                      </span>
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{medicine.dosage}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-16 sm:w-20 flex items-center">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Frequency:
                      </span>
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{medicine.frequency}</span>
                    </div>
                    {medicine.time && (
                      <div className="flex">
                        <span className="text-gray-500 dark:text-gray-400 w-16 sm:w-20 flex items-center">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Time:
                        </span>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{medicine.time}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 sm:mt-4 md:mt-5 pt-2 sm:pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2 sm:gap-3">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors rounded-lg sm:rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      asChild
                    >
                      <Link to={`/edit-medicine/${medicine._id}`} className="flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg sm:rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(medicine._id);
                      }}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Recent Logs Section */}
      <motion.div 
        className="mt-8 sm:mt-12 md:mt-16"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
      >
        <div className="glass-card mobile-card-shadow transform transition-all hover:shadow-lg dark:bg-gray-700/60">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-accent/5 via-secondary/5 to-accent/5 dark:from-accent/10 dark:via-secondary/10 dark:to-accent/10 px-4 sm:px-6 md:px-7 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center shadow-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-accent dark:text-accent sm:w-5 sm:h-5"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 ml-2 sm:ml-3">
                  Activity Log
                </h2>
              </div>
              
              {/* Responsive navigation links */}
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="rounded-full text-xs sm:text-sm text-accent dark:text-accent hover:bg-accent/5 dark:hover:bg-accent/10"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToReminderLogs();
                  }}
                >
                  <Link to="/reminder-logs" className="flex items-center">
                    <span className="hidden sm:inline mr-1">Reminder Logs</span>
                    <span className="sm:hidden">Reminder<br/>Logs</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="ml-1 sm:w-4 sm:h-4"
                    >
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="rounded-full text-xs sm:text-sm text-accent dark:text-accent hover:bg-accent/5 dark:hover:bg-accent/10"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/logs');
                  }}
                >
                  <Link to="/logs" className="flex items-center">
                    <span className="hidden sm:inline mr-1">View All</span>
                    <span className="sm:hidden">View<br/>All</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="ml-1 sm:w-4 sm:h-4"
                    >
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Log content */}
          <motion.div 
            className="p-4 sm:p-6 md:p-8 mobile-animate-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {activityLogsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 text-center max-w-lg mx-auto">
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 flex items-center justify-center mb-4 sm:mb-6 shadow-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-accent dark:text-accent sm:w-8 sm:h-8"
                  >
                    <path d="M12 8v4l3 3"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </motion.div>
                
                <motion.h3 
                  className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Your activity timeline
                </motion.h3>
                <motion.p 
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  Recent medication activities will appear here
                </motion.p>
                <motion.p 
                  className="text-xs sm:text-sm text-gray-500 dark:text-gray-500"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  Track your medication history and adherence over time
                </motion.p>
                
                <motion.div 
                  className="mt-6 sm:mt-8 w-full max-w-xs bg-white/50 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-dashed border-gray-200 dark:border-gray-700/50"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.5 }}
                  transition={{ 
                    delay: 0.7, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    y: -5, 
                    opacity: 0.8,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mr-2 sm:mr-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent dark:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-16 sm:w-24 mb-1.5 sm:mb-2"></div>
                      <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-12 sm:w-16"></div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">9:30 AM</div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div 
                className="space-y-3 sm:space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {activityLogs.map((log) => (
                  <motion.div 
                    key={log._id} 
                    className="flex items-center p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all"
                    variants={itemVariants}
                    whileHover={{ y: -2, boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)" }}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-sm flex-shrink-0">
                      {log.status === 'taken' ? (
                        <div className="w-full h-full rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : log.status === 'missed' ? (
                        <div className="w-full h-full rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      ) : log.status === 'skipped' ? (
                        <div className="w-full h-full rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-lg sm:rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 truncate">
                        {log.medicineId?.name || "Unknown Medicine"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)} at {formatTime(log.time || "")}
                      </p>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </motion.div>
                ))}
                
                <div className="flex justify-center mt-4 sm:mt-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="rounded-full text-xs sm:text-sm text-accent dark:text-accent hover:bg-accent/5 dark:hover:bg-accent/10 border border-accent/20"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToLogs();
                    }}
                  >
                    <Link to="/logs" className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2">
                      <span>View All Activity</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="ml-1 sm:ml-2 sm:w-4 sm:h-4"
                      >
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Medicine Detail Sheet */}
      <MedicineDetailSheet
        medicine={selectedMedicine}
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        onDelete={handleDelete}
        onLogMedicine={logMedicineStatus}
        isActionLoading={selectedMedicine ? actionsLoading[selectedMedicine._id] : false}
      />
    </Container>
  )
} 