import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ThemeToggle({ 
  className = '',
  variant = 'ghost',
  size = 'icon'
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`rounded-full transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'text-yellow-300 scale-0 absolute' : 'text-yellow-500 scale-100'}`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'text-indigo-300 scale-100' : 'text-indigo-600 scale-0 absolute'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 