import { apiClient } from './api-client';
import { 
  StreakResponse, 
  EntriesResponse, 
  ProjectsResponse, 
  CreateEntryRequest, 
  CreateProjectRequest,
  DeleteEntryResponse
} from './types';

export interface EntryDay {
  day: string;
  daily_duration: number | null;
  have_entries: boolean;
}

export interface EntriesDaysResponse {
  status: boolean;
  status_code: number;
  description: string;
  entries_days: EntryDay[];
}

export interface CardsData {
  total_logged: number;
  monthly_goal: number;
  daily_goal: number;
}

export interface CardsResponse {
  status: boolean;
  status_code: number;
  description: string;
  cards_dict: CardsData;
}

export interface DashboardData {
  entriesDays: EntryDay[];
  missingDays: number;
  totalHours: number;
  recentDays: EntryDay[];
  cardsData: CardsData;
  streak: number;
}

class DashboardService {
  async getEntriesDays(dateStart: string, dateEnd: string): Promise<EntriesDaysResponse> {
    try {
      const queryParams = new URLSearchParams({
        dat_start: dateStart,
        dat_end: dateEnd,
      });
      
      const response = await apiClient.get<EntriesDaysResponse>(`/api/entries/days?${queryParams}`);
      return response;
    } catch (error) {

      throw error;
    }
  }

  async getCardsData(dateStart: string, dateEnd: string): Promise<CardsResponse> {
    try {
      const queryParams = new URLSearchParams({
        dat_start: dateStart,
        dat_end: dateEnd,
      });
      
      const response = await apiClient.get<CardsResponse>(`/api/entries/cards?${queryParams}`);
      return response;
    } catch (error) {

      throw error;
    }
  }

  async getStreak(): Promise<StreakResponse> {
    try {
      const response = await apiClient.get<StreakResponse>('/api/entries/streak');
      return response;
    } catch (error) {

      throw error;
    }
  }

  async getEntries(dateStart: string, dateEnd: string): Promise<EntriesResponse> {
    try {
      const queryParams = new URLSearchParams({
        dat_start: dateStart,
        dat_end: dateEnd,
      });
      const response = await apiClient.get<EntriesResponse>(`/api/entries/?${queryParams}`);
      return response;
    } catch (error) {

      throw error;
    }
  }

  async getEntriesPaginated(
    offset: number, 
    limit: number, 
    search?: string, 
    dat_start?: string,
    dat_end?: string,
    requireTotalCount: boolean = false
  ): Promise<EntriesResponse> {
    try {
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });
      
      if (requireTotalCount) {
        queryParams.append('require_total_count', 'true');
      }
      if (search) {
        queryParams.append('search', search);
      }
      if (dat_start) {
        queryParams.append('dat_start', dat_start);
      }
      if (dat_end) {
        queryParams.append('dat_end', dat_end);
      }
      
      const response = await apiClient.get<EntriesResponse>(`/api/entries/?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getProjects(): Promise<ProjectsResponse> {
    try {
      const response = await apiClient.get<ProjectsResponse>('/api/entries/projects');
      return response;
    } catch (error) {

      throw error;
    }
  }

  async createProject(projectData: CreateProjectRequest): Promise<void> {
    try {
      await apiClient.post('/api/entries/projects', projectData);
    } catch (error) {

      throw error;
    }
  }

  async createEntry(entryData: CreateEntryRequest): Promise<void> {
    try {
      await apiClient.post('/api/entries/', entryData);
    } catch (error) {

      throw error;
    }
  }

  async updateEntry(entryId: number, entryData: CreateEntryRequest): Promise<void> {
    try {
      await apiClient.put(`/api/entries/?entry_id=${entryId}`, entryData);
    } catch (error) {
      throw error;
    }
  }

  async deleteEntry(entryId: number): Promise<DeleteEntryResponse> {
    try {
      const response = await apiClient.delete<DeleteEntryResponse>(`/api/entries/?entry_id=${entryId}`);
      return response;
    } catch (error) {

      throw error;
    }
  }

  calculateStats(entriesDays: EntryDay[], weekDaysList: string[] = []): {
    missingDays: number;
    totalHours: number;
    recentDays: EntryDay[];
  } {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const validDays = entriesDays.filter(day => {
      const dayDate = new Date(day.day);
      return dayDate <= currentDate;
    });
    
    const todayString = new Date().toISOString().split('T')[0];
    const todayExists = validDays.some(day => day.day === todayString);
    
    if (!todayExists) {
      const todayEntry: EntryDay = {
        day: todayString,
        daily_duration: null,
        have_entries: false
      };
      validDays.push(todayEntry);
    }
    
    const missingDays = validDays.filter(day => !day.have_entries).length;
    
    const totalHours = validDays.reduce((total, day) => {
      return total + ((day.daily_duration || 0) / 3600);
    }, 0);

    const getDayName = (dateString: string): string => {
      const date = new Date(dateString);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return dayNames[date.getDay()];
    };

    const isWorkDay = (dateString: string): boolean => {
      if (weekDaysList.length === 0) return true;
      const dayName = getDayName(dateString);
      return weekDaysList.includes(dayName);
    };

    const getDayPriority = (day: EntryDay): number => {
      const dayName = getDayName(day.day);
      const isWorkDayForUser = weekDaysList.includes(dayName);
      const isToday = new Date(day.day).toDateString() === new Date().toDateString();
      
      if (isToday) return 1000;
      if (isWorkDayForUser) return 100;
      return 0;
    };

    const sortedDays = validDays.sort((a, b) => {
      const priorityA = getDayPriority(a);
      const priorityB = getDayPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      return new Date(b.day).getTime() - new Date(a.day).getTime();
    });

    let recentDays = sortedDays.slice(0, 7);
    
    const today = new Date().toDateString();
    const todayInList = recentDays.find(day => new Date(day.day).toDateString() === today);
    
    if (!todayInList) {
      const todayData = validDays.find(day => new Date(day.day).toDateString() === today);
      
      if (todayData) {
        recentDays = [todayData, ...recentDays.slice(0, 6)];
      }
    }

    return {
      missingDays,
      totalHours,
      recentDays,
    };
  }

  async getDashboardData(dateStart: string, dateEnd: string, weekDaysList: string[] = []): Promise<DashboardData> {
    try {
      const [entriesResponse, cardsResponse, streakResponse] = await Promise.all([
        this.getEntriesDays(dateStart, dateEnd),
        this.getCardsData(dateStart, dateEnd),
        this.getStreak()
      ]);
      
      const stats = this.calculateStats(entriesResponse.entries_days, weekDaysList);
      
      return {
        entriesDays: entriesResponse.entries_days,
        cardsData: cardsResponse.cards_dict,
        streak: streakResponse.entries_streak,
        ...stats,
      };
    } catch (error) {

      throw error;
    }
  }
}

export const dashboardService = new DashboardService(); 