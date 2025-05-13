import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={cn(
      'min-h-screen w-full flex flex-col transition-all duration-300',
      isMobile ? 'bg-gray-50' : 'bg-gradient-to-br from-gray-50 to-gray-100',
      className
    )}>
      {/* Header for both mobile and desktop */}
      <Navbar 
        isMobile={isMobile} 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
      />
      
      {/* Main content with different styling for mobile and desktop */}
      <main className={cn(
        'flex-grow w-full py-4 md:py-6 transition-all duration-300',
        isMobile ? 'px-4' : 'px-6 md:px-8 lg:px-12'
      )}>
        <div className={cn(
          'mx-auto w-full transition-all duration-300',
          isMobile ? 'max-w-full' : 'max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px]'
        )}>
          <Outlet />
        </div>
      </main>
      
      {/* Footer with adaptive styling */}
      <footer className={cn(
        'w-full py-4 transition-all duration-300',
        isMobile 
          ? 'bg-white border-t border-gray-200 px-4' 
          : 'bg-white/80 backdrop-blur-sm border-t border-gray-200/60 px-6 md:px-8 lg:px-12'
      )}>
        <div className={cn(
          'mx-auto text-center text-gray-500 text-sm',
          isMobile ? 'max-w-full' : 'max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px]'
        )}>
          &copy; {new Date().getFullYear()} MediRemind App. All rights reserved.
        </div>
      </footer>
      
      {/* Mobile menu overlay */}
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        />
      )}
    </div>
  );
} 