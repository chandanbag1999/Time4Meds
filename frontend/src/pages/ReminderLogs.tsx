import { useState, useEffect, useCallback } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import apiService from "../services/api"
import { useToast } from "@/contexts/ToastContext"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import { Loader2 } from "lucide-react"

// Define the ReminderLog interface
interface ReminderLog {
  id: string
  medicineName: string
  medicineId?: string
  time?: string
  status: string
  date: string
  notes?: string
}

// Define Medicine interface for the dropdown
interface Medicine {
  _id: string
  name: string
}

// Define response interface for pagination
interface LogsResponse {
  logs: ReminderLog[]
  totalPages: number
  currentPage: number
}

const ReminderLogs = () => {
  const [logs, setLogs] = useState<ReminderLog[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
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
        const data = await apiService.get<Medicine[]>("/medicines")
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

  // Fetch logs with pagination and medicine filter
  const fetchLogs = useCallback(async (page = 1, medicineId = selectedMedicineId, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      // Build the API endpoint with query parameters
      let endpoint = `/reminders/log?limit=10&page=${page}`
      if (medicineId && medicineId !== "all") {
        endpoint += `&medicineId=${medicineId}`
      }
      
      const response = await apiService.get(endpoint)
      
      // Process response data
      let logsData: ReminderLog[] = []
      let totalPagesData = 1
      let currentPageData = page
      
      if (response) {
        // Handle different response formats
        if (typeof response === 'object' && response !== null) {
          if ('logs' in response && Array.isArray(response.logs)) {
            logsData = response.logs as ReminderLog[]
            totalPagesData = (response as LogsResponse).totalPages || 1
            currentPageData = (response as LogsResponse).currentPage || page
          } else if (Array.isArray(response)) {
            logsData = response as ReminderLog[]
          } else if ('data' in response) {
            const responseData = response.data
            if (Array.isArray(responseData)) {
              logsData = responseData as ReminderLog[]
            } else if (responseData && typeof responseData === 'object' && 'logs' in responseData) {
              logsData = (responseData.logs as ReminderLog[]) || []
              totalPagesData = (responseData as LogsResponse).totalPages || 1
              currentPageData = (responseData as LogsResponse).currentPage || page
            }
          }
        }
      }
      
      // Update state based on whether we're appending or replacing
      if (append) {
        setLogs(prevLogs => [...prevLogs, ...logsData])
      } else {
        setLogs(logsData)
      }
      
      setTotalPages(totalPagesData)
      setCurrentPage(currentPageData)
      setError("")
    } catch (err) {
      console.error("Error fetching reminder logs:", err)
      setError("Failed to load reminder logs. Please try again.")
      toast("Failed to load reminder logs", "error")
      
      // Only show fallback data if not appending
      if (!append) {
        // Fallback to sample data if API fails
        const sampleData = [
          { id: "1", medicineName: "Aspirin", medicineId: "1", time: "08:00", status: "taken", date: "2023-06-01T08:15:00Z", notes: "Taken with water" },
          { id: "2", medicineName: "Vitamin D", medicineId: "2", time: "07:30", status: "missed", date: "2023-06-01T07:30:00Z", notes: "Forgot to take" },
          { id: "3", medicineName: "Amoxicillin", medicineId: "3", time: "20:00", status: "taken", date: "2023-05-31T20:00:00Z", notes: "" },
          { id: "4", medicineName: "Lisinopril", medicineId: "4", time: "09:00", status: "taken", date: "2023-05-31T09:00:00Z", notes: "" },
          { id: "5", medicineName: "Metformin", medicineId: "5", time: "13:00", status: "skipped", date: "2023-05-30T13:00:00Z", notes: "Felt nauseous" }
        ]
        
        // Filter sample data if a medicine is selected
        const filteredData = medicineId && medicineId !== "all"
          ? sampleData.filter(log => log.medicineId === medicineId)
          : sampleData
          
        setLogs(filteredData)
        setTotalPages(2) // Mock total pages
        setCurrentPage(1)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedMedicineId, toast])

  // Initial fetch on mount and when filter changes
  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when filter changes
    fetchLogs(1, selectedMedicineId, false)
  }, [fetchLogs, selectedMedicineId])

  // Handle medicine selection
  const handleMedicineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMedicineId(e.target.value)
  }

  // Handle load more
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchLogs(currentPage + 1, selectedMedicineId, true)
    }
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
    <Container size={isMobile ? "lg" : "2xl"} className="px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Reminder Logs</h1>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="medicineFilter" className="text-sm font-medium text-gray-700 sm:w-1/3">
                Filter by Medicine
              </label>
              <div className="w-full sm:w-2/3">
                <select
                  id="medicineFilter"
                  className="bg-white rounded-xl border border-gray-300 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedMedicineId}
                  onChange={handleMedicineChange}
                  disabled={loading}
                >
                  <option value="all">All Medicines</option>
                  {medicines.map(medicine => (
                    <option key={medicine._id} value={medicine._id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMedicineId !== "all" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setSelectedMedicineId("all")}
                  disabled={loading}
                  aria-label="Clear medicine filter"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mb-6">
              <p className="text-yellow-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
          
          {/* Table Content */}
          <div className="overflow-x-auto relative">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="ml-2 text-indigo-600">Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No reminder logs found.</p>
              </div>
            ) : isMobile ? (
              // Mobile view with cards
              <div className="divide-y">
                {logs.map(log => (
                  <div key={log.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium mb-1">{log.medicineName}</div>
                        <div className="text-sm text-gray-500 mb-1">
                          {formatDate(log.date)} at {log.time || formatTime(log.date)}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(log.status)}
                        </div>
                        {log.notes && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Note:</span> {log.notes}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full" aria-label={`View details for ${log.medicineName}`}>Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view with table
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
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
                      <TableCell>{log.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="rounded-full" aria-label={`View details for ${log.medicineName}`}>Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {/* Load More Button */}
            {!loading && logs.length > 0 && currentPage < totalPages && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export default ReminderLogs