import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentDaysCard } from "@/components/dashboard/RecentDaysCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { EntriesTable } from "@/components/dashboard/EntriesTable";
import { DashboardFilter } from "@/components/dashboard/DashboardFilter";
import { TimeNavigation } from "@/components/dashboard/TimeNavigation";
import { useDashboardFilter } from "@/hooks/use-dashboard-filter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle
} from "lucide-react";
import {useEntries} from "@/hooks/use-entries";
import {useState} from "react";
import {Entry} from "@/lib/types";
import {AddEntryModal} from "@/components/dashboard/AddEntryModal";
import {DeleteEntryModal} from "@/components/dashboard/DeleteEntryModal";

export default function Dashboard() {
  const { t } = useTranslation();
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

  const { data: dashboardData, isLoading: isLoadingDashboard, error: errorDashboard, refreshData } = useDashboardData(dateRange, selectedPeriod, weekDaysList);
  const { entries, isLoading: isLoadingEntries, error: errorEntries, refetch } = useEntries(dateRange);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    entryId: number;
    entryTitle: string;
  }>({
    isOpen: false,
    entryId: 0,
    entryTitle: "",
  });

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
    refetch();
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDelete = (entryId: number, entryTitle: string) => {
    setDeleteModal({
      isOpen: true,
      entryId,
      entryTitle,
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
  }

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, entryId: 0, entryTitle: "" });
  };

  const handleDeleteSuccess = () => {
    handleEntryAdded();
    handleCloseDeleteModal();
  }

  return (
      <>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("dashboard.welcome")}
            </p>
          </div>

          {/* Error Display */}
          {errorDashboard && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive text-sm">
                  {t("dashboard.errorLoading", { error: errorDashboard })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <StatsCard
                title={t("dashboard.periodHours", { period: getPeriodDisplayName(selectedPeriod) })}
                value={isLoadingDashboard ? "..." : `${((dashboardData?.cardsData?.total_logged || 0) / 3600).toFixed(1)}h`}
                description={t(selectedPeriod === 'custom' ? "dashboard.hoursLoggedThisPeriodCustom" : "dashboard.hoursLoggedThisPeriod", { period: selectedPeriod })}
                icon={Clock}
            />
            <StatsCard
                title={t("dashboard.periodGoal", { period: getPeriodDisplayName(selectedPeriod) })}
                value={isLoadingDashboard ? "..." : `${calculateGoalForPeriod(selectedPeriod).toFixed(1)}h`}
                description={t("dashboard.yourCurrentPeriodGoal", { period: selectedPeriod })}
                icon={Target}
            />
            <StatsCard
                title={t("dashboard.currentStreak")}
                value={isLoadingDashboard ? "..." : `${dashboardData?.streak || 0} days`}
                description={t("dashboard.consecutiveDays")}
                icon={Zap}
            />
            <StatsCard
                title={t("dashboard.missingDays")}
                value={isLoadingDashboard ? "..." : dashboardData?.missingDays.toString() || "0"}
                description={t(selectedPeriod === 'custom' ? "dashboard.missingDaysThisPeriodCustom" : "dashboard.missingDaysThisPeriod", { period: selectedPeriod })}
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
                  isLoading={isLoadingDashboard}
                  weekDaysList={weekDaysList}
                  onEntryAdded={handleEntryAdded}
              />
              <ProgressCard
                  title={t("dashboard.periodProgress", { period: getPeriodDisplayName(selectedPeriod) })}
                  current={(dashboardData?.cardsData?.total_logged || 0) / 3600}
                  target={calculateGoalForPeriod(selectedPeriod)}
                  unit="h"
                  description={t("dashboard.onTrack", { period: selectedPeriod, dateRange: getFormattedDateRange() })}
                  isLoading={isLoadingDashboard}
              />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <EntriesTable
                  entries={entries}
                  isLoading={isLoadingEntries}
                  error={errorEntries}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        <AddEntryModal
            isOpen={showAddModal}
            onClose={handleCloseModal}
            onSuccess={handleEntryAdded}
            entryToEdit={editingEntry}
        />

        <DeleteEntryModal
            isOpen={deleteModal.isOpen}
            onClose={handleCloseDeleteModal}
            onSuccess={handleDeleteSuccess}
            entryId={deleteModal.entryId}
            entryTitle={deleteModal.entryTitle}
        />
      </>
  );
}