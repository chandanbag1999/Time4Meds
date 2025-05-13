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
        errorMessage = "No response from server. Please check your connection.";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8 sm:px-6 md:px-8">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center">Login to Your Account</h1>
        
        {errors.server && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errors.server}</span>
          </div>
        )}
        
        <form className="mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline mt-1 sm:mt-0">
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          
          <LoadingButton 
            type="submit" 
            className="w-full"
            isLoading={isSubmitting}
            loadingText="Logging in..."
          >
            Login
          </LoadingButton>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
} 