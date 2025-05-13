import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Link } from "react-router-dom"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import { Spinner } from "@/components/ui/spinner"

// Define the ReminderLog interface
interface ReminderLog {
  id: string
  medicineName: string
  medicineId?: string
  time?: string
  status: string
  date: string
}

// Define Medicine interface for the dropdown
interface Medicine {
  _id: string
  name: string
}

const ReminderLogs = () => {
  const [logs, setLogs] = useState<ReminderLog[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch medicines for the dropdown
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await apiService.get<Medicine[]>("/api/medicines")
        setMedicines(data)
      } catch (err) {
        console.error("Error fetching medicines:", err)
        // Fallback sample data
        setMedicines([
          { _id: "1", name: "Aspirin" },
          { _id: "2", name: "Vitamin D" },
          { _id: "3", name: "Amoxicillin" },
          { _id: "4", name: "Lisinopril" },
          { _id: "5", name: "Metformin" }
        ])
      }
    }

    fetchMedicines()
  }, [])

  // Fetch logs with optional medicine filter
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        
        // Build the API endpoint with query parameter if a medicine is selected
        const endpoint = selectedMedicineId 
          ? `/api/reminders/log?medicineId=${selectedMedicineId}`
          : "/api/reminders/log"
          
        const data = await apiService.get<ReminderLog[]>(endpoint)
        setLogs(data)
      } catch (err) {
        console.error("Error fetching reminder logs:", err)
        setError("Failed to load reminder logs. Please try again.")
        toast("Failed to load reminder logs", "error")
        
        // Fallback to sample data if API fails
        const sampleData = [
          { id: "1", medicineName: "Aspirin", medicineId: "1", time: "08:00", status: "taken", date: "2023-06-01T08:15:00Z" },
          { id: "2", medicineName: "Vitamin D", medicineId: "2", time: "07:30", status: "missed", date: "2023-06-01T07:30:00Z" },
          { id: "3", medicineName: "Amoxicillin", medicineId: "3", time: "20:00", status: "taken", date: "2023-05-31T20:00:00Z" },
          { id: "4", medicineName: "Lisinopril", medicineId: "4", time: "09:00", status: "taken", date: "2023-05-31T09:00:00Z" },
          { id: "5", medicineName: "Metformin", medicineId: "5", time: "13:00", status: "skipped", date: "2023-05-30T13:00:00Z" }
        ]
        
        // Filter sample data if a medicine is selected
        const filteredData = selectedMedicineId
          ? sampleData.filter(log => log.medicineId === selectedMedicineId)
          : sampleData
          
        setLogs(filteredData)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [toast, selectedMedicineId])

  // Handle medicine selection
  const handleMedicineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMedicineId(e.target.value)
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      taken: "bg-green-100 text-green-800",
      missed: "bg-red-100 text-red-800",
      skipped: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800"
    }
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    )
  }

  return (
    <Container size={isMobile ? "lg" : "2xl"} className="px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">Reminder Logs</h1>
      </div>
      
      {/* Medicine Filter */}
      <div className="mb-6">
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-64">
                <label htmlFor="medicineFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Medicine
                </label>
                <select
                  id="medicineFilter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMedicineId}
                  onChange={handleMedicineChange}
                  disabled={loading}
                >
                  <option value="">All Medicines</option>
                  {medicines.map(medicine => (
                    <option key={medicine._id} value={medicine._id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMedicineId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="self-end mb-0.5"
                  onClick={() => setSelectedMedicineId("")}
                  disabled={loading}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {error && (
        <Card variant="glass" className="mb-6">
          <CardContent className="p-4">
            <p className="text-yellow-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <strong>Error:</strong> {error}
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card variant="glass">
        <CardHeader className="bg-gray-50 border-b px-4 py-3">
          <CardTitle className="text-lg">Medication Reminder History</CardTitle>
        </CardHeader>
        
        {loading ? (
          isMobile ? (
            <CardContent className="p-4">
              <CardSkeleton count={4} />
            </CardContent>
          ) : (
            <TableSkeleton columns={5} rows={4} />
          )
        ) : logs.length === 0 ? (
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No reminder logs found.</p>
          </CardContent>
        ) : isMobile ? (
          // Mobile view with cards
          <CardContent className="p-0 divide-y">
            {logs.map(log => (
              <div key={log.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium mb-1">{log.medicineName}</div>
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(log.date)} at {log.time || formatTime(log.date)}
                    </div>
                    <div>{getStatusBadge(log.status)}</div>
                  </div>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              </div>
            ))}
          </CardContent>
        ) : (
          // Desktop view with table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.medicineName}</TableCell>
                  <TableCell>{formatDate(log.date)}</TableCell>
                  <TableCell>{log.time || formatTime(log.date)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <CardFooter className="bg-gray-50 border-t px-4 py-3 flex justify-between">
          <div>
            <span className="text-sm text-gray-600">Showing {logs.length} entries</span>
          </div>
          <LoadingButton 
            variant="outline" 
            size="sm"
            isLoading={false} // You can add a loadMore state here
            onClick={() => {/* Add loadMore function */}}
          >
            Load More
          </LoadingButton>
        </CardFooter>
      </Card>
    </Container>
  )
}

export default ReminderLogs 