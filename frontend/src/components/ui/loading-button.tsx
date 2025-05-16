import React from "react"
import { Button } from "./button-modern"
import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ isLoading = false, loadingText, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Spinner size="sm" className="mr-2" />
            {loadingText || children}
          </span>
        ) : (
          children
        )}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton } 