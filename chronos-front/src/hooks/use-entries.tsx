import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/lib/dashboard-service';
import { formatDateToISO } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export function useEntries(dateRange: DateRange | undefined) {
  const {
    data: entriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entries', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.resolve({ entries_list: [] });
      }
      return dashboardService.getEntries(
        formatDateToISO(dateRange.from),
        formatDateToISO(dateRange.to)
      )
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!dateRange?.from && !!dateRange?.to,
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

export function useEntriesPaginated(
    offset: number,
    limit: number,
    search?: string,
    dateRange?: { from?: Date; to?: Date }
) {
  const queryClient = useQueryClient();

  const dat_start = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const dat_end = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

  const {
    data: totalCountData,
  } = useQuery({
    queryKey: ['entries-total-count', search, dat_start, dat_end],
    queryFn: () => dashboardService.getEntriesPaginated(0, 1, search, dat_start, dat_end, true),
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
    queryKey: ['entries-paginated', offset, limit, search, dat_start, dat_end],
    queryFn: () => dashboardService.getEntriesPaginated(offset, limit, search, dat_start, dat_end, false),
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