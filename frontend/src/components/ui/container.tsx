import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  centered?: boolean
  withPadding?: boolean
}

export function Container({
  className,
  size = 'lg',
  centered = true,
  withPadding = true,
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        centered && 'mx-auto',
        withPadding && 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12',
        'w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 