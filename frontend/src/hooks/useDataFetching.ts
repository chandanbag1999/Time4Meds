import { useState, useEffect, useCallback } from 'react'
import apiService from '@/services/api'
import { useToast } from '@/contexts/ToastContext'

interface FetchOptions {
  initialFetch?: boolean
  errorMessage?: string
  successMessage?: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  dependencies?: any[]
  transformData?: (data: any) => any
}

/**
 * Custom hook for data fetching with loading and error states
 */
export function useDataFetching<T>(
  endpoint: string,
  options: FetchOptions = {}
) {
  const {
    initialFetch = true,
    errorMessage = 'Failed to fetch data',
    successMessage,
    onSuccess,
    onError,
    dependencies = [],
    transformData
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(initialFetch)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.get<T>(endpoint)
      
      const processedData = transformData ? transformData(response) : response
      setData(processedData)
      
      if (successMessage) {
        toast(successMessage, 'success')
      }
      
      if (onSuccess) {
        onSuccess(processedData)
      }
      
      return processedData
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage
      setError(errorMsg)
      toast(errorMessage, 'error')
      
      if (onError) {
        onError(err)
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [endpoint, errorMessage, successMessage, toast, onSuccess, onError, transformData])

  useEffect(() => {
    if (initialFetch) {
      fetchData()
    }
  }, [initialFetch, fetchData, ...dependencies])

  const refetch = useCallback(async () => {
    return fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export default useDataFetching 