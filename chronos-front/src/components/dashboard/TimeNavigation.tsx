import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { TimeFilterPeriod, DateRange } from "./DashboardFilter";

interface TimeNavigationProps {
  selectedPeriod: TimeFilterPeriod;
  dateRange: DateRange;
  onNavigate: (direction: 'prev' | 'next') => void;
  onReset: () => void;
}

export function TimeNavigation({ 
  selectedPeriod, 
  dateRange, 
  onNavigate, 
  onReset 
}: TimeNavigationProps) {
  const getNavigationLabel = () => {
    switch (selectedPeriod) {
      case 'daily':
        return dateRange.startDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'weekly':
        return `Week of ${dateRange.startDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}`;
      case 'biweekly':
        return `${dateRange.startDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} - ${dateRange.endDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}`;
      case 'monthly':
        return dateRange.startDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      case 'quarterly':
        const quarter = Math.floor(dateRange.startDate.getMonth() / 3) + 1;
        return `Q${quarter} ${dateRange.startDate.getFullYear()}`;
      case 'yearly':
        return dateRange.startDate.getFullYear().toString();
      case 'custom':
        return `${dateRange.startDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} - ${dateRange.endDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}`;
      default:
        return 'Current Period';
    }
  };

  const isCurrentPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (selectedPeriod) {
      case 'daily':
        return dateRange.startDate.toDateString() === today.toDateString();
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return dateRange.startDate.toDateString() === weekStart.toDateString();
      case 'monthly':
        return dateRange.startDate.getMonth() === now.getMonth() && 
               dateRange.startDate.getFullYear() === now.getFullYear();
      case 'yearly':
        return dateRange.startDate.getFullYear() === now.getFullYear();
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
            <span className="text-sm font-medium text-muted-foreground">Current Period:</span>
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
              Today
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