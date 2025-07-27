import { useState, useEffect, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

export type TimeFilterPeriod =
  "daily" |
  "weekly" |
  "biweekly" |
  "monthly" |
  "quarterly" |
  "yearly" |
  "custom";

export const useDashboardFilter = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] =
    useState<TimeFilterPeriod>("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: startDate, to: endDate };
  });

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  const navigatePeriod = useCallback(
    (direction: "prev" | "next") => {
      const newStartDate = new Date(dateRange?.from || new Date());
      const newEndDate = new Date(dateRange?.to || new Date());
      const diffDays = Math.ceil((dateRange?.to?.getTime() || new Date().getTime() - dateRange?.from?.getTime()) / (1000 * 60 * 60 * 24));

      if (direction === 'prev') {
        newStartDate.setDate(newStartDate.getDate() - diffDays);
        newEndDate.setDate(newEndDate.getDate() - diffDays);
      } else {
        newStartDate.setDate(newStartDate.getDate() + diffDays);
        newEndDate.setDate(newEndDate.getDate() + diffDays);
      }

      handleDateRangeChange({ from: newStartDate, to: newEndDate });
    },
    [dateRange, handleDateRangeChange]
  );

  const resetToCurrentPeriod = useCallback(() => {
    let newStartDate: Date;
    let newEndDate: Date;

    const now = new Date();

    switch (selectedPeriod) {
      case 'daily':
        newStartDate = new Date(now);
        newStartDate.setHours(0, 0, 0, 0);
        newEndDate = new Date(now);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        newStartDate = new Date(now);
        newStartDate.setDate(now.getDate() - now.getDay());
        newStartDate.setHours(0, 0, 0, 0);
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'biweekly':
        newStartDate = new Date(now);
        newStartDate.setDate(now.getDate() - 14);
        newStartDate.setHours(0, 0, 0, 0);
        newEndDate = new Date(now);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        newStartDate = new Date(now.getFullYear(), quarter * 3, 1);
        newEndDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        newStartDate = new Date(now.getFullYear(), 0, 1);
        newEndDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        newStartDate = dateRange?.from || new Date();
        newEndDate = dateRange?.to || new Date();
        break;
    }
    handleDateRangeChange({ from: newStartDate, to: newEndDate });
  }, [selectedPeriod, dateRange, handleDateRangeChange]);

  const getFilteredData = useCallback((data: any[], period: TimeFilterPeriod, range?: DateRange) => {
    const filterRange = range || dateRange;
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= filterRange?.from && itemDate <= filterRange?.to;
    });
  }, [dateRange]);

  const getPeriodDisplayName = useCallback((period: TimeFilterPeriod) => {
    const periodMap: { [key in TimeFilterPeriod]: string } = {
      daily: t("dashboardFilter.daily"),
      weekly: t("dashboardFilter.weekly"),
      biweekly: t("dashboardFilter.biweekly"),
      monthly: t("dashboardFilter.monthly"),
      quarterly: t("dashboardFilter.quarterly"),
      yearly: t("dashboardFilter.yearly"),
      custom: t("dashboardFilter.custom"),
    };
    return periodMap[period];
  }, [t]);

  const getFormattedDateRange = useCallback(() => {
    if (!dateRange?.from) return "";
    const formattedFrom = dateRange.from.toLocaleDateString();
    let formattedTo = "";
    if (dateRange.to) {
      formattedTo = dateRange.to.toLocaleDateString();
    } else {
      formattedTo = dateRange.from.toLocaleDateString();
    }
    return `${formattedFrom} - ${formattedTo}`;
  }, [dateRange]);

  return {
    selectedPeriod,
    dateRange,
    handlePeriodChange: setSelectedPeriod,
    handleDateRangeChange,
    navigatePeriod,
    resetToCurrentPeriod,
    getFilteredData,
    getPeriodDisplayName,
    getFormattedDateRange,
  };
}; 