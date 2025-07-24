export function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <img 
            src="/assets/logo_chronos.png" 
            alt="Chronos Logo" 
            className="h-16 w-16 animate-pulse"
          />
          <img 
            src="/assets/logo_chronos_text.png" 
            alt="Chronos" 
            className="h-12"
          />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Setting up your workspace...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we configure your preferences
        </p>
      </div>
    </div>
  );
} 