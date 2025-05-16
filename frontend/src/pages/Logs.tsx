import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import { useToast } from "@/contexts/ToastContext"
import apiService, { api } from "@/services/api"
import LogFilterModal from "@/components/LogFilterModal"
import type { LogFilters } from "@/components/LogFilterModal"
import ActiveFilters from "@/components/ActiveFilters"
import { Filter, Download } from "lucide-react"

interface LogEntry {
  id: number
  medicineName: string
  medicineId?: string
  status: "taken" | "missed" | "skipped"
  time: string
  date?: string
  notes: string
}

interface LogResponse {
  logs: LogEntry[]
  totalPages: number
  currentPage: number
}

// Helper type for response handling
type ApiResponse = {
  [key: string]: any;
  logs?: LogEntry[];
  data?: any;
  results?: any;
  totalPages?: number;
  currentPage?: number;
  pages?: number;
  page?: number;
}

export default function Logs() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<LogFilters>({
    medicineId: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [medicineNames, setMedicineNames] = useState<Record<string, string>>({})
  const [singleLogData, setSingleLogData] = useState<any>(null)
  const [singleLogLoading, setSingleLogLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams()
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch a single log by ID when viewing details
  useEffect(() => {
    const fetchSingleLog = async () => {
      if (id) {
        try {
          setSingleLogLoading(true);
          // Fix: Use the correct API URL (no double 'api')
          const response = await api.get(`/logs/${id}`);
          
          if (response?.data?.success && response.data.data) {
            setSingleLogData(response.data.data);
          } else {
            toast("Log details not found", "error");
            navigate('/logs');
          }
        } catch (error) {
          console.error("Error fetching log details:", error);
          toast("Error loading log details", "error");
          navigate('/logs');
        } finally {
          setSingleLogLoading(false);
        }
      }
    }

    if (id) {
      fetchSingleLog();
    } else {
      setSingleLogData(null);
    }
  }, [id, navigate, toast]);

  // Fetch medicine names for filter display
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const medicines = await apiService.get<Array<{ _id: string, name: string }>>('/medicines')
        if (Array.isArray(medicines)) {
          const namesMap: Record<string, string> = {}
          medicines.forEach(med => {
            namesMap[med._id] = med.name
          })
          setMedicineNames(namesMap)
        }
      } catch (error) {
        console.error('Error fetching medicine names:', error)
      }
    }
    
    fetchMedicines()
  }, [])

  const buildApiUrl = useCallback((page = 1, currentFilters = filters) => {
    let url = `/reminders/log?limit=10&page=${page}`
    
    if (currentFilters.medicineId) {
      url += `&medicineId=${currentFilters.medicineId}`
    }
    
    if (currentFilters.status && currentFilters.status !== 'all') {
      url += `&status=${currentFilters.status}`
    }
    
    if (currentFilters.dateFrom) {
      url += `&dateFrom=${currentFilters.dateFrom}`
    }
    
    if (currentFilters.dateTo) {
      url += `&dateTo=${currentFilters.dateTo}`
    }
    
    if (currentFilters.sortBy) {
      url += `&sortBy=${currentFilters.sortBy}`
    }
    
    if (currentFilters.sortOrder) {
      url += `&sortOrder=${currentFilters.sortOrder}`
    }
    
    return url
  }, [filters])

  const fetchLogs = useCallback(async (page = 1, newFilters?: LogFilters, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const filtersToUse = newFilters || filters
      const url = buildApiUrl(page, filtersToUse)
      console.log('Fetching logs from URL:', url)
      
      const response = await apiService.get(url) as ApiResponse
      console.log('API Response:', response)
      
      // Process response data
      let logsData: LogEntry[] = []
      let totalPagesData = 1
      let currentPageData = page
      
      // Handle different response formats
      if (response) {
        if (typeof response === 'object' && response !== null) {
          // Case 1: Response is { logs: [...], totalPages: X, currentPage: Y }
          if ('logs' in response && Array.isArray(response.logs)) {
            logsData = response.logs as LogEntry[]
            totalPagesData = response.totalPages || 1
            currentPageData = response.currentPage || page
          }
          // Case 2: Response is an array of logs directly
          else if (Array.isArray(response)) {
            logsData = response as LogEntry[]
          }
          // Case 3: Response has a data property containing the logs structure
          else if ('data' in response) {
            const responseData = response.data as ApiResponse
            if (Array.isArray(responseData)) {
              logsData = responseData as LogEntry[]
            } else if (responseData && typeof responseData === 'object') {
              if ('logs' in responseData && Array.isArray(responseData.logs)) {
                logsData = responseData.logs as LogEntry[]
                totalPagesData = responseData.totalPages || 1
                currentPageData = responseData.currentPage || page
              }
            }
          }
          // Case 4: Response has a results property (common in some APIs)
          else if ('results' in response && Array.isArray(response.results)) {
            logsData = response.results as LogEntry[]
            totalPagesData = response.totalPages || response.pages || 1
            currentPageData = response.currentPage || response.page || page
          }
        }
      }
      
      console.log('Processed logs data:', logsData)
      
      if (page === 1 || !append) {
        setLogs(logsData)
      } else {
        setLogs(prevLogs => [...prevLogs, ...logsData])
      }
      
      setTotalPages(totalPagesData)
      setCurrentPage(currentPageData)
    } catch (error) {
      console.error("Error fetching logs:", error)
      
      // If API fails, provide fallback data
      if (page === 1 || !append) {
        // Check if we have medicine names to create more realistic fallback data
        const fallbackLogs: LogEntry[] = []
        
        if (Object.keys(medicineNames).length > 0) {
          // Create fallback logs based on the available medicines
          Object.entries(medicineNames).forEach(([id, name], index) => {
            const statuses: ("taken" | "missed" | "skipped")[] = ["taken", "missed", "skipped"]
            const status = statuses[index % statuses.length]
            
            fallbackLogs.push({
              id: index + 1,
              medicineName: name,
              medicineId: id,
              status,
              time: `${new Date().toLocaleDateString()} ${index % 12 + 1}:00 ${index % 12 >= 6 ? 'PM' : 'AM'}`,
              notes: `Sample ${status} log for ${name}`
            })
          })
        }
        
        // If no medicines were found, use generic fallback data
        if (fallbackLogs.length === 0) {
          fallbackLogs.push(
            { id: 1, medicineName: "Aspirin", medicineId: "1", status: "taken", time: "2023-07-01 08:30 AM", notes: "Taken with breakfast" },
            { id: 2, medicineName: "Vitamin D", medicineId: "2", status: "missed", time: "2023-07-01 09:00 AM", notes: "Forgot" },
            { id: 3, medicineName: "Amoxicillin", medicineId: "3", status: "skipped", time: "2023-06-30 08:00 PM", notes: "Felt nauseous" }
          )
        }
        
        setLogs(fallbackLogs)
        toast("Using sample data - couldn't connect to the server", "info")
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [buildApiUrl, filters, toast, medicineNames])

  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  const loadMore = async () => {
    if (currentPage >= totalPages) return
    
    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      await fetchLogs(nextPage, undefined, true)
    } catch (error) {
      toast("Failed to load more logs", "error")
    } finally {
      setLoadingMore(false)
    }
  }
  
  const handleExport = async () => {
    try {
      // Build export URL with current filters
      let exportUrl = '/reminders/log/export'
      const queryParams = []
      
      if (filters.medicineId) {
        queryParams.push(`medicineId=${filters.medicineId}`)
      }
      
      if (filters.status && filters.status !== 'all') {
        queryParams.push(`status=${filters.status}`)
      }
      
      if (filters.dateFrom) {
        queryParams.push(`dateFrom=${filters.dateFrom}`)
      }
      
      if (filters.dateTo) {
        queryParams.push(`dateTo=${filters.dateTo}`)
      }
      
      if (queryParams.length > 0) {
        exportUrl += `?${queryParams.join('&')}`
      }
      
      // Using the raw axios instance for direct blob response
      const response = await api.get(exportUrl, {
        responseType: 'blob'
      })
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medication-logs-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast("Export successful", "success")
    } catch (error) {
      toast("Failed to export logs", "error")
      console.error("Export error:", error)
    }
  }
  
  const openFilterModal = () => {
    setIsFilterModalOpen(true)
  }
  
  const closeFilterModal = () => {
    setIsFilterModalOpen(false)
  }
  
  const applyFilters = (newFilters: LogFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
    fetchLogs(1, newFilters, false)
  }
  
  const clearFilter = (key: keyof LogFilters) => {
    const newFilters = { ...filters }
    
    if (key === 'status') {
      newFilters[key] = 'all'
    } else if (key === 'sortBy') {
      newFilters[key] = 'date'
    } else if (key === 'sortOrder') {
      newFilters[key] = 'desc'
    } else {
      newFilters[key] = ''
    }
    
    setFilters(newFilters)
    setCurrentPage(1)
    fetchLogs(1, newFilters, false)
  }
  
  const clearAllFilters = () => {
    const resetFilters: LogFilters = {
      medicineId: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc'
    }
    
    setFilters(resetFilters)
    setCurrentPage(1)
    fetchLogs(1, resetFilters, false)
  }
  
  const viewLogDetails = (id: number) => {
    navigate(`/logs/${id}`)
  }
  
  // Helper to get status badge styles
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      taken: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      missed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      skipped: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    };
    
    return statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  // Render single log view if ID is provided
  if (id && singleLogLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mx-auto border dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/logs" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              &larr; Back to Logs
            </Link>
            <h1 className="text-2xl font-semibold ml-2 dark:text-gray-100">Log Details</h1>
          </div>
          <div className="py-8">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }
  
  if (id && singleLogData) {
    const log = singleLogData;
    const medicineName = log.medicineId?.name || 'Unknown Medicine';
    const status = log.status || 'unknown';
    const timestamp = new Date(log.timestamp).toLocaleString();
    const dosage = log.medicineId?.dosage || '';
    const notes = log.notes || '';
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mx-auto border dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/logs" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              &larr; Back to Logs
            </Link>
            <h1 className="text-2xl font-semibold ml-2 dark:text-gray-100">Log Details</h1>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{medicineName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p className={`mt-1 inline-block px-2 py-1 text-sm rounded-full ${getStatusBadge(status)}`}>
                      {status}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Taken</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{timestamp}</p>
                  </div>
                  {dosage && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosage</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{dosage}</p>
                    </div>
                  )}
                  {notes && (
                    <div className="col-span-1 md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate('/logs')}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/30"
              >
                Back to Logs
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular logs list view
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mx-auto border dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-2xl font-semibold ml-2 dark:text-gray-100">Medication Logs</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              size="sm" 
              className="rounded-full bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50/50 shadow-sm dark:bg-transparent dark:text-indigo-400 dark:border-gray-600/50 dark:hover:bg-gray-700/30"
              onClick={openFilterModal}
            >
              <Filter size={16} className="mr-1" /> Filter
            </Button>
            <Button 
              size="sm" 
              className="rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-sm transition-all dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
              onClick={handleExport}
            >
              <Download size={16} className="mr-1" /> Export
            </Button>
          </div>
        </div>
        
        <ActiveFilters 
          filters={filters}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
          medicineNames={medicineNames}
        />
        
        <div className="overflow-x-auto">
          {loading ? (
            isMobile ? (
              <div className="p-4">
                <CardSkeleton count={4} />
              </div>
            ) : (
              <TableSkeleton columns={5} rows={4} />
            )
          ) : logs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No medication logs found.</p>
              {Object.values(filters).some(v => v !== '' && v !== 'all') && (
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Try adjusting your filters to see more results.
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                You can add medication logs by taking or skipping medications from your dashboard.
              </p>
              <Button
                className="mt-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-sm transition-all dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : isMobile ? (
            // Mobile view using cards
            <div className="p-0 divide-y dark:divide-gray-700">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex flex-wrap items-center gap-2 dark:text-gray-100">
                        {log.medicineName}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{log.time}</div>
                      {log.notes && <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Note: {log.notes}</div>}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="self-start text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                      onClick={() => viewLogDetails(log.id)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop view using table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium dark:text-gray-200">{log.medicineName}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">{log.time}</TableCell>
                    <TableCell className="dark:text-gray-400">{log.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => viewLogDetails(log.id)}
                        className="text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {logs.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t dark:border-gray-700 flex justify-center rounded-b-xl">
              <LoadingButton 
                variant="outline" 
                size="sm" 
                isLoading={loadingMore}
                loadingText="Loading..."
                onClick={loadMore}
                className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50/70 shadow-sm dark:border-gray-600/50 dark:text-gray-300 dark:hover:bg-gray-700/30"
                disabled={currentPage >= totalPages}
              >
                {currentPage >= totalPages ? "No More Logs" : "Load More"}
              </LoadingButton>
            </div>
          )}
        </div>
      </div>
      
      <LogFilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        onApplyFilters={applyFilters}
        currentFilters={filters}
      />
    </div>
  )
} 