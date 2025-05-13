import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button-modern"
import { LoadingButton } from "@/components/ui/loading-button"
import { Container } from "@/components/ui/container"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import MedicineDetailSheet from "@/components/MedicineDetailSheet"

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
  const [userName, setUserName] = useState("")
  const [usingSampleData, setUsingSampleData] = useState(false)
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  // State for the medicine detail sheet
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)

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
      // Clear the location state to prevent showing the toast again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state, toast])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get medicines from API
        const data = await apiService.get<Medicine[]>("/api/medicines")
        // Ensure data is an array
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

    fetchData()
  }, [])

  // Fetch today's reminders
  useEffect(() => {
    const fetchTodayReminders = async () => {
      try {
        setRemindersLoading(true)
        
        // Format today's date in YYYY-MM-DD format for the API
        const today = new Date()
        const formattedDate = today.toISOString().split('T')[0]
        
        // Get reminders for today only
        const data = await apiService.get<ReminderLog[]>(`/api/reminders/log?date=${formattedDate}`)
        // Ensure data is an array
        setTodayReminders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching today's reminders:", err)
        // Use sample data if API fails
        if (usingSampleData) {
          setTodayReminders(generateSampleReminders())
        } else {
          // Ensure todayReminders is always an array
          setTodayReminders([])
        }
      } finally {
        setRemindersLoading(false)
      }
    }

    fetchTodayReminders()
    
    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchTodayReminders()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [usingSampleData])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        if (!usingSampleData) {
          await apiService.delete(`/api/medicines/${id}`)
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
    setActionsLoading(prev => ({ ...prev, [medicineId]: true }))
    
    try {
      const currentTime = new Date().toISOString()
      const logData = {
        medicineId,
        status,
        date: currentTime,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
      
      if (!usingSampleData) {
        await apiService.post('/api/reminders/log', logData)
      }
      
      // Update local state to show the change immediately
      const updatedReminders = todayReminders.map(reminder => {
        if (reminder.medicineId === medicineId && reminder.status === 'pending') {
          return { ...reminder, status }
        }
        return reminder
      })
      setTodayReminders(updatedReminders)
      
      const statusText = status === 'taken' ? 'taken' : 'skipped'
      toast(`${medicineName} marked as ${statusText}`, 'success')
    } catch (err) {
      console.error(`Error logging medicine as ${status}:`, err)
      toast(`Failed to log medicine status`, 'error')
    } finally {
      // Remove loading state for this medicine
      setActionsLoading(prev => ({ ...prev, [medicineId]: false }))
    }
  }

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
      pending: "bg-blue-100 text-blue-800",
      taken: "bg-green-100 text-green-800",
      missed: "bg-red-100 text-red-800",
      skipped: "bg-yellow-100 text-yellow-800"
    }
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    )
  }

  // Open medicine detail sheet
  const openMedicineDetail = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailSheetOpen(true);
  };

  return (
    <Container size={isMobile ? "lg" : "2xl"} className="px-4 sm:px-6 py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-transparent bg-clip-text">
          Welcome{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="text-gray-600">Manage your medications and keep track of your health.</p>
      </div>

      {/* Today's Reminders Section */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold">Today's Reminders</h2>
          <Button 
            variant="outline" 
            size="sm"
            href="/reminder-logs"
            asChild
            className="w-full sm:w-auto"
          >
            <Link to="/reminder-logs">View All Reminders</Link>
          </Button>
        </div>
        
        {remindersLoading ? (
          isMobile ? (
            <div className="space-y-3">
              <CardSkeleton count={3} />
            </div>
          ) : (
            <Card variant="glass" className="overflow-hidden">
              <TableSkeleton columns={4} rows={3} />
            </Card>
          )
        ) : todayReminders.length === 0 ? (
          <Card variant={isMobile ? "mobile" : "glass"} className="animate-fadeIn text-center py-5">
            <CardContent>
              <p className="text-gray-600">No reminders scheduled for today.</p>
            </CardContent>
          </Card>
        ) : isMobile ? (
          // Mobile view
          <div className="space-y-3 animate-fadeIn">
            {todayReminders.map((reminder) => (
              <Card key={reminder.id} variant="mobile" className="hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg">{reminder.medicineName}</div>
                      <div className="text-sm text-gray-500">{formatTime(reminder.time || reminder.date)}</div>
                    </div>
                    {getStatusBadge(reminder.status)}
                  </div>
                  
                  {reminder.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <LoadingButton
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'taken')}
                        isLoading={actionsLoading[reminder.medicineId]}
                        loadingText="Taking..."
                      >
                        Take Now
                      </LoadingButton>
                      <LoadingButton
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'skipped')}
                        isLoading={actionsLoading[reminder.medicineId]}
                        loadingText="Skipping..."
                      >
                        Skip
                      </LoadingButton>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop view using ShadCN Table
          <Card variant="glass" className="animate-fadeIn overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayReminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">{reminder.medicineName}</TableCell>
                    <TableCell className="text-gray-600">{formatTime(reminder.time || reminder.date)}</TableCell>
                    <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                    <TableCell className="text-right">
                      {reminder.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <LoadingButton
                            variant="primary"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'taken')}
                            isLoading={actionsLoading[reminder.medicineId]}
                            loadingText="Taking..."
                          >
                            Take Now
                          </LoadingButton>
                          <LoadingButton
                            variant="secondary"
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => logMedicineStatus(reminder.medicineId, reminder.medicineName, 'skipped')}
                            isLoading={actionsLoading[reminder.medicineId]}
                            loadingText="Skipping..."
                          >
                            Skip
                          </LoadingButton>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {reminder.status === 'taken' ? 'Taken' : 
                           reminder.status === 'missed' ? 'Missed' : 'Skipped'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Your Medications</h2>
        <Button 
          variant="primary" 
          size={isMobile ? "md" : "md"}
          leftIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          href="/add-medicine"
          asChild
          className="w-full sm:w-auto"
        >
          <Link to="/add-medicine">Add Medicine</Link>
        </Button>
      </div>
      
      {usingSampleData && (
        <Card variant="glass" className="mb-6">
          <CardContent className="p-4">
            <p className="text-yellow-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <strong>Note:</strong> Using sample data. Backend server is not running or not accessible.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {isMobile ? (
            <CardSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton count={6} />
            </div>
          )}
        </div>
      ) : medicines.length === 0 ? (
        <Card variant={isMobile ? "mobile" : "glass"} className="animate-fadeIn text-center py-10">
          <CardContent>
            <div className="mb-4">
              <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4M9 4v16M15 4v16" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">You haven't added any medications yet.</p>
            <Button 
              variant="primary"
              size="sm"
              href="/add-medicine"
              asChild
            >
              <Link to="/add-medicine">Add Your First Medicine</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {medicines.map((medicine) => (
            <Card 
              key={medicine._id} 
              variant={isMobile ? "mobile" : "glass"}
              className="hover:shadow-sm h-full cursor-pointer"
              onClick={() => openMedicineDetail(medicine)}
            >
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{medicine.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${medicine.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {medicine.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="text-sm space-y-1 flex-grow">
                  <div className="flex">
                    <span className="text-gray-500 w-20">Dosage:</span>
                    <span>{medicine.dosage}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-20">Frequency:</span>
                    <span>{medicine.frequency}</span>
                  </div>
                  {medicine.time && (
                    <div className="flex">
                      <span className="text-gray-500 w-20">Time:</span>
                      <span>{medicine.time}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="flex-1 min-w-[80px]"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    asChild
                  >
                    <Link to={`/edit-medicine/${medicine._id}`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="flex-1 min-w-[80px] text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(medicine._id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
        <Card variant={isMobile ? "mobile" : "glass"}>
          <CardHeader className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Activity Log</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  asChild
                >
                  <Link to="/reminder-logs">Reminder Logs</Link>
                </Button>
                <Button 
                  variant="link" 
                  size="sm" 
                  asChild
                >
                  <Link to="/logs">View All</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            <div className="px-4 py-4">
              <div className="font-medium">Recent medication activities will appear here</div>
              <div className="text-sm text-gray-600 mt-1">Track your medication history</div>
            </div>
          </CardContent>
        </Card>
      </div>

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