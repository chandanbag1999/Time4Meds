import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'mobile' | 'desktop' | 'elevated' | 'outlined'
  isHoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  withBorder?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function Card({
  className,
  variant = 'default',
  isHoverable = false,
  padding = 'md',
  withBorder = false,
  rounded = 'lg',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  const variantClasses = {
    default: 'bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm dark:bg-gray-800/80 dark:border-white/5',
    mobile: 'bg-white shadow-sm dark:bg-gray-800',
    desktop: 'bg-white shadow-sm w-full dark:bg-gray-800',
    elevated: 'bg-white shadow-md border border-gray-50 dark:bg-gray-800 dark:border-gray-700',
    outlined: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        isHoverable && 'transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/30',
        withBorder && !variant.includes('outlined') && !variant.includes('glass') && 'border border-gray-200 dark:border-gray-700',
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
      className={cn('font-semibold text-lg dark:text-gray-100', className)}
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
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
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
      className={cn('flex items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  )
} 