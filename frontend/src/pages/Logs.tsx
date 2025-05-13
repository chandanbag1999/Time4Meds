import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import { useToast } from "@/contexts/ToastContext"

interface LogEntry {
  id: number
  medicine: string
  status: "taken" | "missed" | "skipped"
  time: string
  notes: string
}

export default function Logs() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      // Simulate API call with delay
      // In production, replace with actual API call: const data = await apiService.get("/api/logs")
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data for medication logs
      const mockLogs: LogEntry[] = [
        { id: 1, medicine: "Aspirin", status: "taken", time: "Today, 08:15 AM", notes: "" },
        { id: 2, medicine: "Vitamin D", status: "taken", time: "Today, 07:30 AM", notes: "" },
        { id: 3, medicine: "Amoxicillin", status: "taken", time: "Yesterday, 09:00 PM", notes: "" },
        { id: 4, medicine: "Amoxicillin", status: "taken", time: "Yesterday, 01:00 PM", notes: "" },
        { id: 5, medicine: "Amoxicillin", status: "taken", time: "Yesterday, 05:00 AM", notes: "" },
        { id: 6, medicine: "Aspirin", status: "missed", time: "2 days ago, 08:00 AM", notes: "Forgot" },
      ]
      
      setLogs(mockLogs)
    } catch (error) {
      toast("Failed to load logs", "error")
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    try {
      setLoadingMore(true)
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add more mock data
      const moreLogs: LogEntry[] = [
        { id: 7, medicine: "Vitamin C", status: "taken", time: "3 days ago, 08:00 AM", notes: "" },
        { id: 8, medicine: "Aspirin", status: "skipped", time: "3 days ago, 08:00 PM", notes: "Felt better" }
      ]
      
      setLogs(prevLogs => [...prevLogs, ...moreLogs])
    } catch (error) {
      toast("Failed to load more logs", "error")
    } finally {
      setLoadingMore(false)
    }
  }
  
  // Helper to get status badge styles
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      taken: "bg-green-100 text-green-800",
      missed: "bg-red-100 text-red-800",
      skipped: "bg-yellow-100 text-yellow-800"
    };
    
    return statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 md:px-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">Medication Logs</h1>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
            <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
            <div className="flex gap-2 sm:gap-3">
              <Button size="sm" variant="outline">Filter</Button>
              <Button size="sm" variant="outline">Export</Button>
            </div>
          </div>
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
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No medication logs found.</p>
          </CardContent>
        ) : isMobile ? (
          // Mobile view using cards
          <CardContent className="p-0 divide-y">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="px-4 py-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex flex-wrap items-center gap-2">
                      {log.medicine}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{log.time}</div>
                    {log.notes && <div className="text-sm text-gray-500 mt-1">Note: {log.notes}</div>}
                  </div>
                  <Button size="sm" variant="ghost" className="self-start">Details</Button>
                </div>
              </div>
            ))}
          </CardContent>
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
                  <TableCell className="font-medium">{log.medicine}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell>{log.time}</TableCell>
                  <TableCell>{log.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="bg-gray-50 px-4 py-3 border-t flex justify-center">
          <LoadingButton 
            variant="outline" 
            size="sm" 
            isLoading={loadingMore}
            loadingText="Loading..."
            onClick={loadMore}
          >
            Load More
          </LoadingButton>
        </div>
      </Card>
    </div>
  )
} 