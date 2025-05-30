import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string
  thumbClassName?: string
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, thumbClassName, onCheckedChange, checked, ...props }, ref) => {
    const id = React.useId()
    const inputId = props.id || `switch-${id}`

    // Handle the onChange event to support onCheckedChange
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={inputId}
          className="peer sr-only"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "relative h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-gray-950 peer-focus-visible:ring-offset-2",
            "peer-checked:bg-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "dark:bg-gray-700 dark:peer-checked:bg-gray-50",
            className
          )}
        >
          <span
            className={cn(
              "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
              "peer-checked:translate-x-5 dark:bg-gray-950 dark:peer-checked:bg-gray-950",
              thumbClassName
            )}
          />
        </label>
      </div>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
