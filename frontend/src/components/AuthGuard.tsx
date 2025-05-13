import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '@/services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const isAuthenticated = authService.isLoggedIn();

  useEffect(() => {
    // Check token validity on mount and when location changes
    if (!isAuthenticated) {
      console.log('User is not authenticated, redirecting to login');
    }
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 