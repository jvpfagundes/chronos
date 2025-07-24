export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  birth_date: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface OnboardingRequest {
  monthly_goal: number;
  daily_goal: number;
  week_days_list: string[];
}

export interface OnboardingResponse {
  status: boolean;
  desc_error?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  monthly_goal?: number;
  daily_goal?: number;
  week_days_list?: string[];
  theme?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  monthly_goal?: number;
  daily_goal?: number;
  week_days_list?: string[];
  theme?: string;
}

export interface UpdateUserResponse {
  status: boolean;
  desc_error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
}

export interface StreakResponse {
  status: boolean;
  description?: string;
  entries_streak: number;
}

export interface Entry {
  id: number;
  title: string;
  description: string;
  duration: number;
  datm_start: string;
  datm_end: string;
  datm_interval_start?: string;
  datm_interval_end?: string;
  project_name: string;
  entrie_date: string;
}

export interface EntriesResponse {
  status: boolean;
  description?: string;
  entries_list: Entry[];
  total_count?: number;
}

export interface DeleteEntryResponse {
  status: boolean;
  description?: string;
}

export interface Project {
  id: number;
  name: string;
}

export interface ProjectsResponse {
  status: boolean;
  projects_list: Project[];
}

export interface CreateEntryRequest {
  date: string;
  datm_start: string;
  datm_end: string;
  datm_interval_start?: string;
  datm_interval_end?: string;
  title: string;
  description: string;
  project_id: number;
}

export interface CreateProjectRequest {
  name: string;
} 