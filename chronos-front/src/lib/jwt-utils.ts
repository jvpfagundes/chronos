import { UserInfo } from './types';

export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {

    return null;
  }
}

export function extractUserFromJWT(token: string): UserInfo | null {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return null;
    

    const isFirstAccess = decoded.is_first_access === true || decoded.is_first_access === 'true';
    localStorage.setItem('is_first_access', isFirstAccess.toString());
    
    return {
      id: decoded.user_id || 0,
      email: decoded.email || '',
      first_name: decoded.first_name || '',
      last_name: decoded.last_name || '',
      monthly_goal: decoded.monthly_goal ? Number(decoded.monthly_goal) : undefined,
      daily_goal: decoded.daily_goal ? Number(decoded.daily_goal) : undefined,
      week_days_list: decoded.week_days_list || undefined,
      theme: decoded.theme || 'light',
      language: decoded.language || 'en',
    };
  } catch (error) {
    console.error('Error extracting user from JWT:', error);
    return null;
  }
} 