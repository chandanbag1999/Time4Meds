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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={cn(
      'min-h-screen w-full flex flex-col transition-all duration-300 overflow-x-hidden',
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
      <main className="flex-grow w-full py-4 md:py-6 transition-all duration-300">
        <Container size="full">
          <Outlet />
        </Container>
      </main>
      
      {/* Footer with adaptive styling */}
      <footer className={cn(
        'w-screen py-4 transition-all duration-300',
        isMobile 
          ? 'bg-white border-t border-gray-200' 
          : 'bg-white/80 backdrop-blur-sm border-t border-gray-200/60'
      )}>
        <Container size="full" className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Time4Meds. All rights reserved.
        </Container>
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