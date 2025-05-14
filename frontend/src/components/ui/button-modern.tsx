import React from 'react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
  href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      href,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white dark:focus:ring-indigo-400',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 dark:border-gray-600 dark:bg-transparent dark:text-gray-200 dark:hover:border-gray-500 dark:hover:text-white dark:hover:bg-gray-800',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
      link: 'bg-transparent text-indigo-600 hover:text-indigo-700 hover:underline p-0 h-auto focus:ring-0 dark:text-indigo-400 dark:hover:text-indigo-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm dark:bg-red-700 dark:hover:bg-red-800 dark:text-white',
    }

    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2.5 h-10',
      lg: 'text-base px-6 py-3 h-12',
    }

    const baseStyles = cn(
      'relative inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-gray-900',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      variant !== 'link' && 'shadow-sm',
      className
    )

    // Check if children is a React element that's a Link component
    const childIsLink = React.isValidElement(children) && 
                        children.type === Link;

    if (asChild && href) {
      // If the child is already a Link component, don't wrap it in another Link
      if (childIsLink) {
        // Pass the baseStyles to the child Link component
        return React.cloneElement(
          children as React.ReactElement<any>,
          {
            className: cn(baseStyles, (children as React.ReactElement<any>).props.className)
          },
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {(children as React.ReactElement<any>).props.children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        );
      }
      
      // Otherwise, create a new Link
      return (
        <Link
          to={href}
          className={baseStyles}
        >
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </Link>
      )
    }

    return (
      <button
        className={baseStyles}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={isLoading ? 'invisible' : ''}>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 