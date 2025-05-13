import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginCredentials } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { LoadingButton } from "@/components/ui/loading-button";

type FormErrors = {
  email?: string;
  password?: string;
  server?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  
  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await login(formData);
      // Show success toast
      success(`Welcome back${formData.email ? ', ' + formData.email.split('@')[0] : ''}!`, {
        title: "Login Successful"
      });
      // Redirect to the intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle different types of errors
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 401) {
          errorMessage = "Invalid email or password";
        } else if (status === 404) {
          errorMessage = "User not found";
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Request made but no response received
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          errorMessage = "Cannot connect to the server. Please make sure the backend server is running at http://localhost:5000.";
        } else {
          errorMessage = "No response from server. Please check your connection.";
        }
      } else if (error.code === 'ERR_CONNECTION_REFUSED') {
        errorMessage = "Connection refused. The backend server is not running or not accessible.";
      }
      
      // Set form error
      setErrors({ server: errorMessage });
      
      // Show toast for error
      toastError(errorMessage, {
        title: "Login Failed"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-500">Sign in to continue to Time4Meds</p>
            </div>
            
            {errors.server && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.server}</span>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 py-3 bg-gray-50 border ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"} rounded-lg shadow-sm focus:ring-2 w-full transition-colors`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 py-3 bg-gray-50 border ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"} rounded-lg shadow-sm focus:ring-2 w-full transition-colors`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>
              
              <LoadingButton 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white rounded-lg transition ease-in duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md"
                isLoading={isSubmitting}
                loadingText="Signing in..."
              >
                Sign In
              </LoadingButton>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right side - Image and Text */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <svg className="w-12 h-12 mb-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold mb-4">Time4Meds</h2>
            <p className="mb-6 opacity-90">Stay on track with your medication schedule and never miss a dose again.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span>Get timely reminders</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span>Manage your medications</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Track medication adherence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 