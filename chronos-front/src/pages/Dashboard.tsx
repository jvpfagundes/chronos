import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentDaysCard } from "@/components/dashboard/RecentDaysCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { EntriesTable } from "@/components/dashboard/EntriesTable";
import { DashboardFilter } from "@/components/dashboard/DashboardFilter";
import { TimeNavigation } from "@/components/dashboard/TimeNavigation";
import { useDashboardFilter } from "@/hooks/use-dashboard-filter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Zap,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { 
    selectedPeriod, 
    dateRange,
    handlePeriodChange, 
    handleDateRangeChange,
    navigatePeriod,
    resetToCurrentPeriod,
    getPeriodDisplayName,
    getFormattedDateRange
  } = useDashboardFilter();

  const { getGoals, getWeekDays } = useAuth();
  const { monthly_goal, daily_goal } = getGoals();
  const weekDaysList = getWeekDays();

  const { data: dashboardData, isLoading, error, refreshData } = useDashboardData(dateRange, selectedPeriod, weekDaysList);

  const calculateGoalForPeriod = (period: string): number => {
    switch (period) {
      case 'daily':
        return daily_goal;
      case 'weekly':
        return daily_goal * 7;
      case 'biweekly':
        return daily_goal * 14;
      case 'monthly':
        return monthly_goal;
      case 'quarterly':
        return monthly_goal * 3;
      case 'yearly':
        return monthly_goal * 12;
      case 'custom':
        return monthly_goal;
      default:
        return monthly_goal;
    }
  };

  const handleEntryAdded = () => {
    refreshData();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your time tracking overview.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">
            Error loading dashboard data: {error}
          </p>
        </div>
      )}

      {/* Filter Section */}
      <div className="space-y-4">
        <DashboardFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
        <TimeNavigation
          selectedPeriod={selectedPeriod}
          dateRange={dateRange}
          onNavigate={navigatePeriod}
          onReset={resetToCurrentPeriod}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={`${getPeriodDisplayName(selectedPeriod)} Hours`}
          value={isLoading ? "..." : `${((dashboardData?.cardsData?.total_logged || 0) / 3600).toFixed(1)}h`}
          description={`Hours logged ${selectedPeriod === 'custom' ? 'in selected period' : `this ${selectedPeriod}`}`}
          icon={Clock}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={`${getPeriodDisplayName(selectedPeriod)} Goal`}
          value={isLoading ? "..." : `${calculateGoalForPeriod(selectedPeriod).toFixed(1)}h`}
          description={`Your current ${selectedPeriod} goal`}
          icon={Target}
        />
        <StatsCard
          title="Current Streak"
          value={isLoading ? "..." : `${dashboardData?.streak || 0} days`}
          description="Consecutive days with entries"
          icon={Zap}
          trend={{ value: 25, isPositive: true }}
        />
        <StatsCard
          title="Missing Days"
          value={isLoading ? "..." : dashboardData?.missingDays.toString() || "0"}
          description={`Days without entries ${selectedPeriod === 'custom' ? 'in selected period' : `this ${selectedPeriod}`}`}
          icon={AlertCircle}
          className="border-warning/20 bg-warning-light/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <RecentDaysCard 
            recentDays={dashboardData?.recentDays}
            isLoading={isLoading}
            weekDaysList={weekDaysList}
            onEntryAdded={handleEntryAdded}
          />
          <ProgressCard
            title={`${getPeriodDisplayName(selectedPeriod)} Progress`}
            current={(dashboardData?.cardsData?.total_logged || 0) / 3600}
            target={calculateGoalForPeriod(selectedPeriod)}
            unit="h"
            description={`You're on track to meet your ${selectedPeriod} goal! (${getFormattedDateRange()})`}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <EntriesTable />
        </div>
      </div>
    </div>
  );
}