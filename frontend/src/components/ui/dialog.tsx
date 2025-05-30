import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

export function Dialog({ children, className, open, onOpenChange }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open || false)
  
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])
  
  React.useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen)
    }
  }, [isOpen, onOpenChange])
  
  // Handle escape key to close dialog
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("keydown", handleEscapeKey)
    return () => document.removeEventListener("keydown", handleEscapeKey)
  }, [isOpen])
  
  // Prevent scrolling on body when dialog is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])
  
  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      <div className={cn(className)}>
        {children}
      </div>
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children, className }: { children: React.ReactNode, className?: string }) {
  const context = React.useContext(DialogContext)
  
  if (!context) {
    throw new Error("DialogTrigger must be used within a Dialog component")
  }
  
  const { setOpen } = context
  
  return (
    <button
      type="button"
      className={cn(className)}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  )
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  const context = React.useContext(DialogContext)
  
  if (!context) {
    throw new Error("DialogContent must be used within a Dialog component")
  }
  
  const { open, setOpen } = context
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 max-h-[85vh] overflow-auto",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  )
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
      {children}
    </p>
  )
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}>
      {children}
    </div>
  )
}
