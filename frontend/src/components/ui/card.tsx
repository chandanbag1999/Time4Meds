import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'mobile' | 'desktop'
  isHoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  withBorder?: boolean
}

export function Card({
  className,
  variant = 'default',
  isHoverable = false,
  padding = 'md',
  withBorder = false,
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const variantClasses = {
    default: 'bg-white shadow-sm rounded-lg',
    glass: 'glass-effect backdrop-blur-glass',
    mobile: 'mobile-card',
    desktop: 'desktop-card w-full',
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        isHoverable && 'transition-all duration-200 hover:shadow-md',
        withBorder && 'border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 mb-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-semibold text-lg', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center mt-4 pt-3 border-t border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
} 