import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !token) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray950">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-6">
            <img 
              src="/assets/logo_chronos.png" 
              alt="Chronos Logo" 
              className="h-16 w-16 animate-pulse"
            />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
} 