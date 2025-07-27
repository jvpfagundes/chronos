import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/dashboard-service";
import { formatDateToISO } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { TimeFilterPeriod } from "./use-dashboard-filter";

export const useDashboardData = (
  dateRange: DateRange | undefined,
  period: TimeFilterPeriod,
  weekDays: string[]
) => {
  const {
    data,
    isLoading,
    error,
    refetch: refreshData,
  } = useQuery({
    queryKey: [
      "dashboard-data",
      dateRange?.from,
      dateRange?.to,
      period,
      weekDays,
    ],
    queryFn: () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.resolve(null);
      }
      return dashboardService.getDashboardData(
        formatDateToISO(dateRange.from),
        formatDateToISO(dateRange.to),
        period,
        weekDays
      );
    },
    enabled: !!dateRange?.from && !!dateRange?.to && weekDays.length > 0,
  });

  return {
    data,
    isLoading,
    error,
    refreshData,
  };
}