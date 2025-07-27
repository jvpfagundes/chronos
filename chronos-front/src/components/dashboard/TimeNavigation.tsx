import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { TimeFilterPeriod } from "@/hooks/use-dashboard-filter";
import { useTranslation } from "react-i18next";
import { DateRange } from "react-day-picker";

interface TimeNavigationProps {
  selectedPeriod: TimeFilterPeriod;
  dateRange: DateRange | undefined;
  onNavigate: (direction: 'prev' | 'next') => void;
  onReset: () => void;
}

export function TimeNavigation({
  selectedPeriod,
  dateRange,
  onNavigate,
  onReset
}: TimeNavigationProps) {
  const { t, i18n } = useTranslation();

  const getNavigationLabel = () => {
    if (!dateRange || !dateRange.from) {
      return "";
    }

    const locale = i18n.language;
    switch (selectedPeriod) {
      case 'daily':
        return dateRange.from.toLocaleDateString(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'weekly':
        return t('timeNavigation.weekOf', { date: dateRange.from.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) });
      case 'biweekly':
        return `${dateRange.from.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric'
        })} - ${dateRange.to?.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric'
        })}`;
      case 'monthly':
        return dateRange.from.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long'
        });
      case 'quarterly':
        const quarter = Math.floor(dateRange.from.getMonth() / 3) + 1;
        return t('timeNavigation.quarter', { quarter: quarter, year: dateRange.from.getFullYear() });
      case 'yearly':
        return dateRange.from.getFullYear().toString();
      case 'custom':
        return `${dateRange.from.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric'
        })} - ${dateRange.to?.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric'
        })}`;
      default:
        return t('timeNavigation.currentPeriodLabel');
    }
  };

  const isCurrentPeriod = () => {
    if (!dateRange || !dateRange.from) {
      return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedPeriod) {
      case 'daily':
        return dateRange.from.toDateString() === today.toDateString();
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return dateRange.from.toDateString() === weekStart.toDateString();
      case 'monthly':
        return dateRange.from.getMonth() === now.getMonth() &&
          dateRange.from.getFullYear() === now.getFullYear();
      case 'yearly':
        return dateRange.from.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  };

  return (
    <Card className="chronos-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t('timeNavigation.currentPeriodLabel')}</span>
            <span className="text-sm font-semibold text-foreground">
              {getNavigationLabel()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isCurrentPeriod()}
              className="h-8 px-3 text-xs"
            >
              {t('timeNavigation.todayButton')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('next')}
              className="h-8 w-8 p-0"
              disabled={isCurrentPeriod()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 