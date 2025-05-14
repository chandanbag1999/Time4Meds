import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

// Get the API URL from environment variables or use a default
// In production, this should be the full URL to your backend
// In development, this can be relative as it will be handled by the Vite proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increase from 10 seconds to 30 seconds
});

// Request interceptor for adding auth token and handling request config
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common response scenarios and errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // You can transform successful responses here if needed
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    const { response } = error;
    
    // Handle specific status codes
    if (response) {
      const status = response.status;
      
      switch (status) {
        case 401: // Unauthorized
          // Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403: // Forbidden
          console.error('Access forbidden');
          break;
          
        case 404: // Not found
          console.error('Resource not found');
          break;
          
        case 500: // Server error
          console.error('Server error:', response.data);
          break;
          
        default:
          // Handle other status codes
          console.error(`Error with status code ${status}:`, response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    // Always reject the promise to let the calling code handle the error
    return Promise.reject(error);
  }
);

// Helper function to validate response data
const validateResponseData = <T>(data: any): T => {
  if (data === undefined || data === null) {
    // Return empty array for collection endpoints
    if (Array.isArray(data)) {
      return [] as unknown as T;
    }
    // Return empty object for single item endpoints
    return {} as T;
  }
  return data as T;
};

// Helper methods for common HTTP methods
const apiService = {
  // Get request
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.get<T>(url, config)
      .then(response => {
        // Special handling for medicines endpoint response structure
        if (url.includes('/medicines')) {
          // Check if response.data.data exists (a common API structure)
          if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            return validateResponseData<T>(response.data.data);
          }
          // Direct response.data for some API designs
          return validateResponseData<T>(response.data);
        }
        
        return validateResponseData<T>(response.data);
      })
      .catch(error => {
        console.error(`GET request failed for ${url}:`, error);
        // For endpoints that typically return arrays, return empty array
        if (url.includes('/medicines') || url.includes('/reminders')) {
          return [] as unknown as T;
        }
        throw error;
      }),
  
  // Post request
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.post<T>(url, data, config)
      .then(response => validateResponseData<T>(response.data)),
  
  // Put request
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.put<T>(url, data, config)
      .then(response => validateResponseData<T>(response.data)),
  
  // Patch request
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.patch<T>(url, data, config)
      .then(response => validateResponseData<T>(response.data)),
  
  // Delete request
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.delete<T>(url, config)
      .then(response => validateResponseData<T>(response.data)),
};

// Export the raw axios instance
export { api };

// Export the enhanced api service as default
export default apiService; 