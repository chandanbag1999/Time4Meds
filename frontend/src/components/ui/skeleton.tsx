import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  count?: number
}

const Skeleton = ({ className, count = 1, ...props }: SkeletonProps) => {
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn("animate-pulse rounded-md bg-gray-200", className)}
            {...props}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

export { Skeleton } 