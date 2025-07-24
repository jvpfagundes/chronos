import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { authService } from '@/lib/auth-service';
import { LoginRequest, RegisterRequest, UserInfo, AuthState, OnboardingRequest } from '@/lib/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  completeOnboarding: (data: OnboardingRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userInfo: UserInfo) => void;
  isFirstAccess: boolean;
  getGoals: () => { monthly_goal: number; daily_goal: number };
  getWeekDays: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  const [isFirstAccess, setIsFirstAccess] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getUserInfo();
        const token = authService.getToken();
        const firstAccess = authService.isFirstAccess();

        setAuthState({
          isAuthenticated,
          user,
          token,
          loading: false,
        });
        setIsFirstAccess(firstAccess);
      } catch (error) {

        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
        setIsFirstAccess(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await authService.login(credentials);
      const user = authService.getUserInfo();
      const isFirstAccess = authService.isFirstAccess();
      
      setAuthState({
        isAuthenticated: true,
        user,
        token: response.access_token,
        loading: false,
      });
      setIsFirstAccess(isFirstAccess);
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await authService.register(userData);
      const user = authService.getUserInfo();
      const isFirstAccess = authService.isFirstAccess();
      
      setAuthState({
        isAuthenticated: true,
        user,
        token: response.access_token,
        loading: false,
      });
      setIsFirstAccess(isFirstAccess);
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const completeOnboarding = async (data: OnboardingRequest) => {
    try {
      await authService.completeOnboarding(data);
      const user = authService.getUserInfo();
      const isFirstAccess = authService.isFirstAccess();
      
      setAuthState(prev => ({
        ...prev,
        user,
      }));
      setIsFirstAccess(isFirstAccess);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
    setIsFirstAccess(false);
  };

  const updateUser = (userInfo: UserInfo) => {
    authService.updateUserInfo(userInfo);
    setAuthState(prev => ({
      ...prev,
      user: userInfo,
    }));
  };

  const getGoals = useCallback(() => {
    const userInfo = authService.getUserInfo();
    if (userInfo) {
      return {
        monthly_goal: userInfo.monthly_goal || 0,
        daily_goal: userInfo.daily_goal || 0,
      };
    }
    return { monthly_goal: 0, daily_goal: 0 };
  }, [authState.user]);

  const getWeekDays = useCallback(() => {
    const userInfo = authService.getUserInfo();
    return userInfo?.week_days_list || [];
  }, [authState.user]);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    completeOnboarding,
    logout,
    updateUser,
    isFirstAccess,
    getGoals,
    getWeekDays,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 