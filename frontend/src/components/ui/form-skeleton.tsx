import React from "react"
import { Skeleton } from "./skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface FormSkeletonProps {
  title?: string
  fields?: number
  showSubmitButton?: boolean
}

const FormSkeleton: React.FC<FormSkeletonProps> = ({ 
  title = "Loading Form", 
  fields = 4,
  showSubmitButton = true
}) => {
  return (
    <Card className="w-full">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {showSubmitButton && (
          <div className="pt-2">
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { FormSkeleton }