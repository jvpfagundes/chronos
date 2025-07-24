import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface OnboardingRouteProps {
  children: ReactNode;
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { isAuthenticated, isFirstAccess, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {

        navigate('/login');
      } else if (!isFirstAccess) {

        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isFirstAccess, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
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


  if (!isAuthenticated || !isFirstAccess) {
    return null;
  }

  return <>{children}</>;
} 