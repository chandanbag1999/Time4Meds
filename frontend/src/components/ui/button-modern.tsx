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
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
      outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      link: 'bg-transparent text-primary-500 hover:underline p-0 h-auto focus:ring-0',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    }

    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-10',
      lg: 'text-base px-6 py-3 h-12',
    }

    const baseStyles = cn(
      'relative inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
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