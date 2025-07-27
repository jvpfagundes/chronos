import { apiClient } from './api-client';
import { API_ENDPOINTS } from './config';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserInfo,
  ApiResponse,
  OnboardingRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  OnboardingResponse
} from './types';
import { extractUserFromJWT, decodeJWT } from './jwt-utils';

class AuthService {
  private userInfo: UserInfo | null = null;
  private readonly LOGIN_ENDPOINT = API_ENDPOINTS.AUTH.LOGIN;
  private readonly REGISTER_ENDPOINT = API_ENDPOINTS.AUTH.REGISTER;

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        this.LOGIN_ENDPOINT,
        credentials
      );
      

      if (!response.access_token) {
        throw new Error('Login falhou: Token não recebido');
      }
      
      this.saveAuthData(response);

      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {

      const registerResponse = await apiClient.post<AuthResponse>(
        this.REGISTER_ENDPOINT,
        userData
      );



      const loginCredentials: LoginRequest = {
        username: userData.email,
        password: userData.password
      };

      const loginResponse = await apiClient.post<AuthResponse>(
        this.LOGIN_ENDPOINT,
        loginCredentials
      );


      if (!loginResponse.access_token) {
        throw new Error('Login automático falhou após registro');
      }
      
      this.saveAuthData(loginResponse);

      return loginResponse;
    } catch (error) {

      if (error instanceof Error && error.message.includes('Login automático falhou')) {
        throw new Error('Registro realizado com sucesso, mas falha no login automático. Tente fazer login manualmente.');
      }
      throw this.handleAuthError(error);
    }
  }

  async completeOnboarding(onboardingData: OnboardingRequest): Promise<OnboardingResponse> {
    try {
      this.validateOnboardingData(onboardingData);

      const response = await apiClient.post<OnboardingResponse>('/api/auth/onboarding', onboardingData);
      
      if (response.status) {
        localStorage.setItem('is_first_access', 'false');
        
        const currentUserInfo = this.getUserInfo();
        if (currentUserInfo) {
          const updatedUserInfo = {
            ...currentUserInfo,
            monthly_goal: onboardingData.monthly_goal,
            daily_goal: onboardingData.daily_goal,
            week_days_list: onboardingData.week_days_list,
          };
          
          this.updateUserInfo(updatedUserInfo);
        }
      }
      
      return response;
    } catch (error) {
      throw this.handleOnboardingError(error);
    }
  }

  async updateUser(userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      const response = await apiClient.patch<UpdateUserResponse>('/api/auth/user', userData);
      
      if (response.status) {
        const currentUserInfo = this.getUserInfo();
        if (currentUserInfo) {
          const updatedUserInfo = {
            ...currentUserInfo,
            ...userData,
          };
          
          this.updateUserInfo(updatedUserInfo);
          
          if (userData.theme) {
            localStorage.setItem('theme', userData.theme);
          }
        }
      }
      
      return response;
    } catch (error) {

      throw error;
    }
  }

  private validateOnboardingData(data: OnboardingRequest): void {
    if (!data.monthly_goal || data.monthly_goal <= 0) {
      throw new Error('Monthly goal must be a positive number');
    }
    
    if (!data.daily_goal || data.daily_goal <= 0) {
      throw new Error('Daily goal must be a positive number');
    }
    
    if (!data.week_days_list || data.week_days_list.length === 0) {
      throw new Error('Please select at least one work day');
    }
    
    if (data.monthly_goal > 1000) {
      throw new Error('Monthly goal cannot exceed 1000 hours');
    }
    
    if (data.daily_goal > 24) {
      throw new Error('Daily goal cannot exceed 24 hours');
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('is_first_access');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = this.getExpirationTime();
    
    if (!token || !expiresAt) {
      return false;
    }


    const isValid = new Date().getTime() < expiresAt;
    
    if (!isValid) {

      this.logout();
    }
    
    return isValid;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserInfo(): UserInfo | null {
    if (this.userInfo) {
      return this.userInfo;
    }

    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      try {
        this.userInfo = JSON.parse(storedUserInfo);
        return this.userInfo;
      } catch (error) {

        return null;
      }
    }

    return null;
  }

  isFirstAccess(): boolean {
    return localStorage.getItem('is_first_access') === 'true';
  }

  updateUserInfo(userInfo: UserInfo): void {
    this.userInfo = userInfo;
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  }

  private saveAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.access_token);
    
    const userInfo = extractUserFromJWT(authResponse.access_token);
    if (userInfo) {
      this.updateUserInfo(userInfo);
    }
    

    const decoded = decodeJWT(authResponse.access_token);
    if (decoded && decoded.is_first_access !== undefined) {
      const isFirstAccess = decoded.is_first_access === true || decoded.is_first_access === 'true';
      localStorage.setItem('is_first_access', isFirstAccess.toString());
    }
    
    const expiresAt = decoded && decoded.exp 
      ? decoded.exp * 1000 
      : new Date().getTime() + (24 * 60 * 60 * 1000);
      
    localStorage.setItem('auth_expires_at', expiresAt.toString());
  }

  private getExpirationTime(): number | null {
    const expiresAt = localStorage.getItem('auth_expires_at');
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  private handleOnboardingError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred during onboarding');
  }

  private handleAuthError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (error && typeof error === 'object') {
      if ('message' in error) {
        return new Error(error.message);
      }
      
      if ('description' in error) {
        return new Error(error.description);
      }
      
      if ('error' in error) {
        return new Error(error.error);
      }
    }
    
    return new Error('Authentication failed');
  }
}

export const authService = new AuthService(); 