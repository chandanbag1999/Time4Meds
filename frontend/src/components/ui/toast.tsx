import { cn } from "@/lib/utils"
import * as React from "react"

// Icons for different toast types
const CheckIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M20 6L9 17l-5-5"></path>
  </svg>
)

const AlertIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

const InfoIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
)

// Custom X icon component to replace dependency on lucide-react
const XIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "default" | "success" | "error" | "warning" | "info"
  title?: string
  onClose?: () => void
  showProgress?: boolean
}

export function Toast({ 
  className, 
  children, 
  type = "default",
  title,
  onClose,
  showProgress = true,
  ...props 
}: ToastProps) {
  // Use refs instead of state to avoid rendering loops
  const progressRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());
  const durationRef = React.useRef<number>(5000); // Default 5 seconds

  // Set up the timer animation without using state updates
  React.useEffect(() => {
    if (showProgress && progressRef.current) {
      // Reset start time when component mounts
      startTimeRef.current = Date.now();

      // Animation function
      const animateProgress = () => {
        if (!progressRef.current) return;
        
        const elapsed = Date.now() - startTimeRef.current;
        const percentage = 100 - Math.min(100, (elapsed / durationRef.current) * 100);
        
        // Apply width directly to the DOM element
        progressRef.current.style.width = `${percentage}%`;
        
        // Stop the timer when progress is complete
        if (percentage <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
        
        // Schedule next frame
        timerRef.current = setTimeout(animateProgress, 16); // ~60fps
      };
      
      // Start animation
      animateProgress();
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showProgress]); // Only depend on showProgress
  
  const baseStyles = "pointer-events-auto relative w-full max-w-sm rounded-lg shadow-lg overflow-hidden"
  const typeStyles = {
    default: "bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
    success: "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30",
    error: "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/30",
    info: "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30"
  }
  
  const iconBackgroundStyles = {
    default: "bg-gray-100 dark:bg-gray-700",
    success: "bg-green-100 dark:bg-green-800/50",
    error: "bg-red-100 dark:bg-red-800/50",
    warning: "bg-yellow-100 dark:bg-yellow-800/50",
    info: "bg-blue-100 dark:bg-blue-800/50"
  }
  
  const progressBarColors = {
    default: "bg-gray-300 dark:bg-gray-600",
    success: "bg-green-300 dark:bg-green-700",
    error: "bg-red-300 dark:bg-red-700",
    warning: "bg-yellow-300 dark:bg-yellow-700",
    info: "bg-blue-300 dark:bg-blue-700"
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon />;
      case 'error':
      case 'warning':
        return <AlertIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <div
      className={cn(
        baseStyles,
        typeStyles[type],
        className
      )}
      {...props}
    >
      {showProgress && (
        <div 
          className={cn("h-1 transition-all duration-100", progressBarColors[type])}
          ref={progressRef}
          style={{ width: "100%" }}
        />
      )}
      
      <div className="px-4 py-3">
        <div className="flex items-start">
          {type !== 'default' && (
            <div className={cn("mr-3 p-1 rounded-full", iconBackgroundStyles[type])}>
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1">
            {title && <div className="font-semibold mb-1">{title}</div>}
            <div className="text-sm">{children}</div>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="ml-4 inline-flex shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              aria-label="Close"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastContainer({ 
  children, 
  position = 'top-right' 
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50 flex flex-col gap-2',
    'top-left': 'fixed top-4 left-4 z-50 flex flex-col gap-2',
    'bottom-right': 'fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2',
    'bottom-left': 'fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-2',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2'
  }

  return (
    <div className={positionClasses[position]}>
      {children}
    </div>
  )
} 