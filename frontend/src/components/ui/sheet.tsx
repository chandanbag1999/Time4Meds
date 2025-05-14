import React from "react"
import { cn } from "@/lib/utils"

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  position?: "bottom" | "right" | "left" | "top";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const Sheet = ({
  children,
  className,
  isOpen,
  onClose,
  position = "right",
  size = "md",
  ...props
}: SheetProps) => {
  // Handle escape key to close sheet
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Prevent scrolling on body when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // If not open, don't render
  if (!isOpen) return null;

  // Position classes
  const positionClasses = {
    top: "inset-x-0 top-0 border-b",
    right: "inset-y-0 right-0 border-l",
    bottom: "inset-x-0 bottom-0 border-t", 
    left: "inset-y-0 left-0 border-r",
  };

  // Size classes
  const sizeClasses = {
    top: {
      sm: "h-1/4",
      md: "h-1/3",
      lg: "h-1/2",
      xl: "h-2/3",
      full: "h-screen",
    },
    right: {
      sm: "w-1/4",
      md: "w-1/3",
      lg: "w-1/2",
      xl: "w-2/3",
      full: "w-screen",
    },
    bottom: {
      sm: "h-1/4",
      md: "h-1/3",
      lg: "h-1/2",
      xl: "h-2/3",
      full: "h-screen",
    },
    left: {
      sm: "w-1/4",
      md: "w-1/3", 
      lg: "w-1/2",
      xl: "w-2/3",
      full: "w-screen",
    },
  };

  // Animation classes based on position
  const animationClasses = {
    top: "animate-slide-in-from-top",
    right: "animate-slide-in-from-right",
    bottom: "animate-slide-in-from-bottom",
    left: "animate-slide-in-from-left",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet content */}
      <div
        className={cn(
          "fixed bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
          positionClasses[position],
          sizeClasses[position][size],
          animationClasses[position],
          "overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 px-6 py-4 border-b border-gray-100 dark:border-gray-700",
      className
    )}
    {...props}
  />
);

const SheetTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-semibold leading-none tracking-tight dark:text-gray-100",
      className
    )}
    {...props}
  />
);

const SheetDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
);

const SheetContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 py-4", className)}
    {...props}
  />
);

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700",
      className
    )}
    {...props}
  />
);

export {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
  SheetFooter,
}; 