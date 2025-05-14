import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/contexts/ToastContext";
import { LoadingButton } from "@/components/ui/loading-button";
import authService from "@/services/authService";

type FormErrors = {
  email?: string;
  server?: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast, success, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear error when user types
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
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
      // Send password reset request to the backend
      const response = await authService.forgotPassword(email);
      
      // Show success message
      success("Password reset link generated", {
        title: "Check Your Email"
      });
      
      // Check if we have a resetToken in the response (development mode)
      if (response && response.resetToken) {
        setResetToken(response.resetToken);
        console.log('Development mode: Reset token received from server');
      }
      
      // Show success state
      setIsSubmitted(true);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Handle different types of errors
      let errorMessage = "Password reset request failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "No account found with this email address";
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Request made but no response received
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          errorMessage = "Cannot connect to the server. Please check your connection.";
        } else {
          errorMessage = "No response from server. Please try again later.";
        }
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

  const goToResetPage = () => {
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
              <p className="text-gray-500">
                {isSubmitted 
                  ? "Check your email for a link to reset your password." 
                  : "Enter your email address and we'll send you a link to reset your password."}
              </p>
            </div>
            
            {errors.server && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.server}</span>
              </div>
            )}
            
            {isSubmitted ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Check your email</p>
                    <p className="text-sm">We've sent a password reset link to {email}</p>
                  </div>
                </div>
                
                {resetToken && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                    <p className="font-medium">Development Mode</p>
                    <p className="text-sm">For testing, you can click the button below to reset your password directly.</p>
                    <div className="mt-2">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={goToResetPage}
                      >
                        Reset Password Now
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <Button
                    onClick={() => {
                      setEmail("");
                      setIsSubmitted(false);
                      setResetToken(null);
                    }}
                    className="mr-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Try another email
                  </Button>
                  <Link to="/login">
                    <Button variant="outline">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
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
                      value={email}
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
                
                <LoadingButton 
                  type="submit" 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white rounded-lg transition ease-in duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md"
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                >
                  Send Reset Link
                </LoadingButton>
                
                <div className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Right side - Image and Text */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <svg className="w-12 h-12 mb-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
            <p className="mb-6 opacity-90">Don't worry, we've got you covered. We'll help you get back into your account.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Check your email</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                  </svg>
                </div>
                <span>Click the reset link</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span>Create a new password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 