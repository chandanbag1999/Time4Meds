import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/contexts/ToastContext";
import { LoadingButton } from "@/components/ui/loading-button";
import authService from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  token?: string;
  server?: string;
};

export default function ResetPassword() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, success, error: toastError } = useToast();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get token from URL query params if not in path params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryToken = queryParams.get('token');
    const resetToken = token || queryToken;
    
    // Show validation in progress message first
    if (!resetToken) {
      setIsValidToken(false);
      setErrors({ token: "Invalid or missing reset token" });
      return;
    }
    
    // Verify token is valid
    const verifyToken = async () => {
      try {
        console.log('Verifying token:', resetToken);
        
        // Verify token with backend
        const isValid = await authService.verifyResetToken(resetToken);
        
        if (!isValid) {
          console.log('Token verification failed');
          setIsValidToken(false);
          setErrors({ token: "This password reset link is invalid or has expired" });
        } else {
          console.log('Token verified successfully');
          setIsValidToken(true);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setIsValidToken(false);
        setErrors({ token: "This password reset link is invalid or has expired" });
      }
    };
    
    verifyToken();
  }, [token, location.search]);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // Get token from either path params or query params
      const queryParams = new URLSearchParams(location.search);
      const queryToken = queryParams.get('token');
      const resetToken = token || queryToken;
      
      if (!resetToken) {
        throw new Error("Reset token is missing");
      }
      
      console.log('Using token for password reset:', resetToken);
      
      // Send password reset request to the backend
      await authService.resetPassword(resetToken, formData.password);
      
      // Show success message
      success("Your password has been reset successfully", {
        title: "Password Reset"
      });
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Handle different types of errors
      let errorMessage = "Password reset failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 400) {
          errorMessage = "Invalid request. Please check your information.";
        } else if (status === 401 || status === 403) {
          errorMessage = "This password reset link is invalid or has expired.";
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = "No response from server. Please try again later.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }
      
      // Set form error
      setErrors({ server: errorMessage });
      
      // Show toast for error
      toastError(errorMessage, {
        title: "Password Reset Failed"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md mx-auto mt-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Invalid Reset Link</h3>
              <p className="mt-1 text-sm text-gray-500">{errors.token}</p>
              <div className="mt-6">
                <Link to="/forgot-password">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Request New Reset Link
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md mx-auto mt-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Password Reset Successful</h3>
              <p className="mt-1 text-sm text-gray-500">Your password has been reset successfully.</p>
              <p className="mt-1 text-sm text-gray-500">Redirecting to login page...</p>
              <div className="mt-6">
                <Link to="/login">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h1>
              <p className="text-gray-500">Create a new password for your account</p>
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
                <Label htmlFor="password" className="text-gray-700 font-medium">New Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 py-3 pr-10 bg-gray-50 border ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"} rounded-lg shadow-sm focus:ring-2 w-full transition-colors`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 py-3 pr-10 bg-gray-50 border ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"} rounded-lg shadow-sm focus:ring-2 w-full transition-colors`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
              <LoadingButton 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white rounded-lg transition ease-in duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md"
                isLoading={isSubmitting}
                loadingText="Resetting Password..."
              >
                Reset Password
              </LoadingButton>
              
              <div className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right side - Image and Text */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <svg className="w-12 h-12 mb-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h2 className="text-3xl font-bold mb-4">Create a New Password</h2>
            <p className="mb-6 opacity-90">Choose a strong password to protect your account.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span>Use at least 8 characters</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span>Mix letters, numbers, and symbols</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span>Don't reuse passwords from other sites</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 