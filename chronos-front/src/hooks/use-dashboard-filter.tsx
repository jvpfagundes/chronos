import { useState, useCallback } from 'react';
import { TimeFilterPeriod, DateRange } from '@/components/dashboard/DashboardFilter';

export function useDashboardFilter() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFilterPeriod>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  });

  const handlePeriodChange = useCallback((period: TimeFilterPeriod) => {
    setSelectedPeriod(period);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const navigatePeriod = useCallback((direction: 'prev' | 'next') => {
    const newStartDate = new Date(dateRange.startDate);
    const newEndDate = new Date(dateRange.endDate);
    const diffDays = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (direction === 'prev') {
      newStartDate.setDate(newStartDate.getDate() - diffDays);
      newEndDate.setDate(newEndDate.getDate() - diffDays);
    } else {
      newStartDate.setDate(newStartDate.getDate() + diffDays);
      newEndDate.setDate(newEndDate.getDate() + diffDays);
    }

    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  }, [dateRange]);

  const resetToCurrentPeriod = useCallback(() => {
    const now = new Date();
    let newStartDate: Date;
    let newEndDate: Date;

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
        newEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  }, [selectedPeriod]);

  const getFilteredData = useCallback((data: any[], period: TimeFilterPeriod, range?: DateRange) => {
    const filterRange = range || dateRange;
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= filterRange.startDate && itemDate <= filterRange.endDate;
    });
  }, [dateRange]);

  const getPeriodDisplayName = useCallback((period: TimeFilterPeriod) => {
    switch (period) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return 'Custom';
      default:
        return 'Monthly';
    }
  }, []);

  const getFormattedDateRange = useCallback(() => {
    const start = dateRange.startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    const end = dateRange.endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  }, [dateRange]);

  return {
    selectedPeriod,
    dateRange,
    handlePeriodChange,
    handleDateRangeChange,
    navigatePeriod,
    resetToCurrentPeriod,
    getFilteredData,
    getPeriodDisplayName,
    getFormattedDateRange,
  };
} 