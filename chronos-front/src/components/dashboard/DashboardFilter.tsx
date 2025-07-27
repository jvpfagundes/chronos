import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDateToISO } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TimeFilterPeriod } from "@/hooks/use-dashboard-filter";
import { DateRange } from "react-day-picker";

interface DashboardFilterProps {
  selectedPeriod: TimeFilterPeriod;
  onPeriodChange: (period: TimeFilterPeriod) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DashboardFilter({
                                  selectedPeriod,
                                  onPeriodChange,
                                  dateRange,
                                  onDateRangeChange
                                }: DashboardFilterProps) {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstWeekDay = firstDay.getDay();

    const weeks = Math.ceil((daysInMonth + firstWeekDay) / 7);
    return Array.from({ length: weeks }, (_, i) => i + 1);
  };

  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth);

  // Calculate quarter based on month
  const getQuarterFromMonth = (month: number) => Math.floor(month / 3) + 1;

  // Update date range when period or specific selections change
  useEffect(() => {
    let newStartDate: Date;
    let newEndDate: Date;

    switch (selectedPeriod) {
      case 'daily':
        newStartDate = new Date();
        newStartDate.setHours(0, 0, 0, 0);
        newEndDate = new Date();
        newEndDate.setHours(23, 59, 59, 999);
        break;

      case 'weekly':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        newStartDate = weekStart;
        newEndDate = new Date(weekStart);
        newEndDate.setDate(weekStart.getDate() + 6);
        newEndDate.setHours(23, 59, 59, 999);
        break;

      case 'biweekly':
        const biweekStart = new Date();
        biweekStart.setDate(biweekStart.getDate() - 14);
        biweekStart.setHours(0, 0, 0, 0);
        newStartDate = biweekStart;
        newEndDate = new Date();
        newEndDate.setHours(23, 59, 59, 999);
        break;

      case 'monthly':
        newStartDate = new Date(selectedYear, selectedMonth, 1);
        newEndDate = new Date(selectedYear, selectedMonth + 1, 0);
        newEndDate.setHours(23, 59, 59, 999);
        break;

      case 'quarterly':
        const quarterStartMonth = (selectedQuarter - 1) * 3;
        newStartDate = new Date(selectedYear, quarterStartMonth, 1);
        newEndDate = new Date(selectedYear, quarterStartMonth + 3, 0);
        newEndDate.setHours(23, 59, 59, 999);
        break;

      case 'yearly':
        newStartDate = new Date(selectedYear, 0, 1);
        newEndDate = new Date(selectedYear, 11, 31);
        newEndDate.setHours(23, 59, 59, 999);
        break;

      default:
        newStartDate = dateRange?.from || new Date();
        newEndDate = dateRange?.to || new Date();
    }

    onDateRangeChange({ from: newStartDate, to: newEndDate });
  }, [selectedPeriod, selectedMonth, selectedYear, selectedWeek, selectedQuarter]);

  const filterOptions = [
    { value: 'daily', label: t('dashboardFilter.daily') },
    { value: 'weekly', label: t('dashboardFilter.weekly') },
    { value: 'biweekly', label: t('dashboardFilter.biweekly') },
    { value: 'monthly', label: t('dashboardFilter.monthly') },
    { value: 'quarterly', label: t('dashboardFilter.quarterly') },
    { value: 'yearly', label: t('dashboardFilter.yearly') },
    { value: 'custom', label: t('dashboardFilter.custom') },
  ] as const;

  const months = [
    t('months.january'), t('months.february'), t('months.march'), t('months.april'), t('months.may'), t('months.june'),
    t('months.july'), t('months.august'), t('months.september'), t('months.october'), t('months.november'), t('months.december')
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
      <Card className="chronos-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>{t('dashboardFilter.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Period Type Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.periodLabel')}</span>
              </div>
              <Select value={selectedPeriod} onValueChange={(value: TimeFilterPeriod) => onPeriodChange(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('dashboardFilter.selectPeriodPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specific Period Selectors */}
            {selectedPeriod === 'monthly' && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.monthLabel')}</span>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {month}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.yearLabel')}</span>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-full sm:w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            )}

            {selectedPeriod === 'quarterly' && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.quarterLabel')}</span>
                    <Select value={selectedQuarter.toString()} onValueChange={(value) => setSelectedQuarter(parseInt(value))}>
                      <SelectTrigger className="w-full sm:w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.yearLabel')}</span>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-full sm:w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            )}

            {selectedPeriod === 'yearly' && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.yearLabel')}</span>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            )}

            {selectedPeriod === 'custom' && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.fromLabel')}</span>
                    <Input
                        type="date"
                        value={dateRange?.from ? formatDateToISO(dateRange.from) : ''}
                        onChange={(e) => {
                          const newStartDate = new Date(e.target.value);
                          onDateRangeChange({ from: newStartDate, to: dateRange?.to });
                        }}
                        className="w-full sm:w-[150px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('dashboardFilter.toLabel')}</span>
                    <Input
                        type="date"
                        value={dateRange?.to ? formatDateToISO(dateRange.to) : ''}
                        onChange={(e) => {
                          const newEndDate = new Date(e.target.value);
                          onDateRangeChange({ from: dateRange?.from, to: newEndDate });
                        }}
                        className="w-full sm:w-[150px]"
                    />
                  </div>
                </div>
            )}

            {/* Date Range Display */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{t('dashboardFilter.showingData')}</span>
              <span className="font-medium">
              {dateRange?.from?.toLocaleDateString()} {t('dashboardFilter.to')} {dateRange?.to?.toLocaleDateString()}
            </span>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}