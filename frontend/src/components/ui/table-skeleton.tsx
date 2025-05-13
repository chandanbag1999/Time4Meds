import React from "react"
import { Skeleton } from "./skeleton"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "./table"

interface TableSkeletonProps {
  columns: number
  rows: number
  showHeader?: boolean
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  columns = 4, 
  rows = 5,
  showHeader = true
}) => {
  return (
    <Table>
      {showHeader && (
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className={colIndex === 0 ? "h-5 w-32" : "h-5 w-20"} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { TableSkeleton }
