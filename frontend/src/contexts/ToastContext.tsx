import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast, ToastContainer } from '@/components/ui/toast';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  title?: string;
  position?: ToastPosition;
  showProgress?: boolean;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  showProgress?: boolean;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, options?: ToastOptions | ToastType) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  dismiss: (id: string) => void;
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [position, setPosition] = useState<ToastPosition>('top-right');

  const createToast = (message: string, options?: ToastOptions | ToastType) => {
    // If options is just a string, it's the type
    const isTypeOnly = typeof options === 'string';
    const type = isTypeOnly ? options as ToastType : (options as ToastOptions)?.type || 'default';
    const duration = isTypeOnly ? 5000 : (options as ToastOptions)?.duration || 5000;
    const title = isTypeOnly ? undefined : (options as ToastOptions)?.title;
    const showProgress = isTypeOnly ? true : (options as ToastOptions)?.showProgress !== false;
    
    const id = Math.random().toString(36).substring(2, 9);
    const toastItem: ToastItem = { 
      id, 
      message, 
      type, 
      title,
      showProgress,
      duration
    };
    
    setToasts((prev) => [...prev, toastItem]);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      dismiss(id);
    }, duration);

    return id;
  };

  const toast = (message: string, options?: ToastOptions | ToastType) => {
    return createToast(message, options);
  };

  const success = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return createToast(message, { ...options, type: 'success' });
  };

  const error = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return createToast(message, { ...options, type: 'error' });
  };

  const warning = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return createToast(message, { ...options, type: 'warning' });
  };

  const info = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return createToast(message, { ...options, type: 'info' });
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const contextValue: ToastContextType = {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    position,
    setPosition
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position}>
        {toasts.map((item) => (
          <Toast 
            key={item.id} 
            type={item.type}
            title={item.title}
            onClose={() => dismiss(item.id)}
            showProgress={item.showProgress}
            className="animate-slideIn"
          >
            {item.message}
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export default ToastContext; 