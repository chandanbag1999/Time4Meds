import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

// Context to manage select state
const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedLabel: string
  setSelectedLabel: React.Dispatch<React.SetStateAction<string>>
} | null>(null)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Select = ({ value, onValueChange, children, className }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (open && !(event.target as Element).closest('[data-select-container="true"]')) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  return (
    <SelectContext.Provider value={{
      value,
      onValueChange,
      open,
      setOpen,
      selectedLabel,
      setSelectedLabel
    }}>
      <div className={cn("relative", className)} data-select-container="true">
        {children}
      </div>
    </SelectContext.Provider>
  )
}
Select.displayName = "Select"

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

const SelectTrigger = ({ className, children }: SelectTriggerProps) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectTrigger must be used within a Select component")
  }

  const { open, setOpen } = context

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus:ring-gray-300",
        className
      )}
      aria-expanded={open}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
    </button>
  )
}
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
  className?: string
}

const SelectValue = ({ placeholder, children, className }: SelectValueProps) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectValue must be used within a Select component")
  }

  const { selectedLabel } = context

  return (
    <span className={cn("block truncate", className)}>
      {selectedLabel || children || placeholder}
    </span>
  )
}
SelectValue.displayName = "SelectValue"

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectContent must be used within a Select component")
  }

  const { open } = context

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 w-full mt-1 overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-80 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className
      )}
    >
      <ul className="p-1 max-h-60 overflow-auto">
        {children}
      </ul>
    </div>
  )
}
SelectContent.displayName = "SelectContent"

interface SelectItemProps {
  className?: string
  children: React.ReactNode
  value: string
}

const SelectItem = ({ className, children, value }: SelectItemProps) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectItem must be used within a Select component")
  }

  const { value: selectedValue, onValueChange, setOpen, setSelectedLabel } = context
  const isSelected = selectedValue === value

  // Update the selected label when this item is selected
  React.useEffect(() => {
    if (isSelected && typeof children === 'string') {
      setSelectedLabel(children)
    }
  }, [isSelected, children, setSelectedLabel])

  const handleSelect = () => {
    onValueChange(value)
    setOpen(false)
  }

  return (
    <li
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-gray-800",
        isSelected && "bg-gray-100 dark:bg-gray-800",
        className
      )}
      onClick={handleSelect}
      role="option"
      aria-selected={isSelected}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="truncate">{children}</span>
    </li>
  )
}
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
