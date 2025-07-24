import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService, DashboardData } from '@/lib/dashboard-service';
import { DateRange, TimeFilterPeriod } from '@/components/dashboard/DashboardFilter';
import { formatDateToISO } from '@/lib/utils';

export function useDashboardData(dateRange: DateRange, selectedPeriod: TimeFilterPeriod, weekDaysList: string[] = []) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: dashboardData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-data', formatDateToISO(dateRange.startDate), formatDateToISO(dateRange.endDate), selectedPeriod, weekDaysList],
    queryFn: () => dashboardService.getDashboardData(
      formatDateToISO(dateRange.startDate),
      formatDateToISO(dateRange.endDate),
      weekDaysList
    ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setIsLoading(queryLoading);
    setError(queryError ? (queryError as Error).message : null);
  }, [queryLoading, queryError]);

  return {
    data: dashboardData,
    isLoading,
    error,
    refreshData,
  };
}

export function useEntries(dateRange: DateRange) {
  const {
    data: entriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entries', formatDateToISO(dateRange.startDate), formatDateToISO(dateRange.endDate)],
    queryFn: () => dashboardService.getEntries(
      formatDateToISO(dateRange.startDate),
      formatDateToISO(dateRange.endDate)
    ),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    entries: entriesData?.entries_list?.sort((a, b) => 
      new Date(b.entrie_date).getTime() - new Date(a.entrie_date).getTime()
    ) || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}

export function useEntriesPaginated(offset: number, limit: number) {
  const queryClient = useQueryClient();

  const {
    data: totalCountData,
  } = useQuery({
    queryKey: ['entries-total-count'],
    queryFn: () => dashboardService.getEntriesPaginated(0, 1, true),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: true,
  });

  const {
    data: entriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entries-paginated', offset, limit],
    queryFn: () => dashboardService.getEntriesPaginated(offset, limit, false),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const totalCount = totalCountData?.total_count || 0;

  return {
    entries: entriesData?.entries_list?.sort((a, b) => 
      new Date(b.entrie_date).getTime() - new Date(a.entrie_date).getTime()
    ) || [],
    totalCount,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
} 