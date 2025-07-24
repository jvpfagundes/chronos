import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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