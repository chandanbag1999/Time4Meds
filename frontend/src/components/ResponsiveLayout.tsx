import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { Container } from './ui/container';

interface ResponsiveLayoutProps {
  className?: string;
}

export default function ResponsiveLayout({ className }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={cn(
      'min-h-screen w-full flex flex-col transition-all duration-300 overflow-x-hidden',
      isMobile ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gray-900',
      className
    )}>
      {/* Header for both mobile and desktop */}
      <Navbar 
        isMobile={isMobile} 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
      />
      
      {/* Main content with different styling for mobile and desktop */}
      <main className="flex-grow w-full py-4 md:py-6 transition-all duration-300">
        <Container size="full">
          <Outlet />
        </Container>
      </main>
      
      {/* Footer with adaptive styling */}
      <footer className={cn(
        'w-full py-5 transition-all duration-300',
        isMobile 
          ? 'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800' 
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-800/60'
      )}>
        <Container size="full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Time4Meds</span>
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Time4Meds. All rights reserved.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </div>
          </div>
        </Container>
      </footer>
      
      {/* Mobile menu overlay */}
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 