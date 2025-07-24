import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { OnboardingRedirect } from "@/components/auth/OnboardingRedirect";
import { OnboardingRoute } from "@/components/auth/OnboardingRoute";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Entries from "./pages/Entries";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="chronos-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
                          {/* Auth Routes */}
            <Route path="/" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            <Route path="/onboarding" element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            } />
              
                          {/* App Routes with Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <OnboardingRedirect>
                  <AppLayout><Dashboard /></AppLayout>
                </OnboardingRedirect>
              </ProtectedRoute>
            } />
            <Route path="/entries" element={
              <ProtectedRoute>
                <OnboardingRedirect>
                  <AppLayout><Entries /></AppLayout>
                </OnboardingRedirect>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <OnboardingRedirect>
                  <AppLayout><Settings /></AppLayout>
                </OnboardingRedirect>
              </ProtectedRoute>
            } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
