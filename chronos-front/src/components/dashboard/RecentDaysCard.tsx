import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Calendar, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryDay } from "@/lib/dashboard-service";
import { formatDate } from "@/lib/utils";
import { AddEntryModal } from "./AddEntryModal";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RecentDaysCardProps {
  recentDays?: EntryDay[];
  isLoading?: boolean;
  weekDaysList?: string[];
  onEntryAdded?: () => void;
}

export function RecentDaysCard({ recentDays = [], isLoading = false, weekDaysList = [], onEntryAdded }: RecentDaysCardProps) {
  const { t } = useTranslation();
  const [addModal, setAddModal] = useState<{
    isOpen: boolean;
    selectedDate: Date | null;
  }>({
    isOpen: false,
    selectedDate: null,
  });

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[date.getDay()];
  };

  const isWorkDay = (dateString: string): boolean => {
    if (weekDaysList.length === 0) return false;
    const dayName = getDayName(dateString);
    return weekDaysList.includes(dayName);
  };

  const isToday = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const input = new Date(year, month - 1, day);

    const now = new Date();
    return (
        input.getFullYear() === now.getFullYear() &&
        input.getMonth() === now.getMonth() &&
        input.getDate() === now.getDate()
    );
  };

  const handleAddEntry = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    
    setAddModal({
      isOpen: true,
      selectedDate,
    });
  };

  const handleAddSuccess = () => {
    if (onEntryAdded) {
      onEntryAdded();
    }
  };

  const handleCloseModal = () => {
    setAddModal({
      isOpen: false,
      selectedDate: null,
    });
  };

  return (
    <>
      <Card className="chronos-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{t('recentDaysCard.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentDays.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('recentDaysCard.noData')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDays.map((day) => {
                const workDay = isWorkDay(day.day);
                const today = isToday(day.day);
                return (
                  <div key={day.day} className={`flex items-center justify-between py-2 rounded-lg px-2 ${
                    today ? 'bg-primary/10 border border-primary/20' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      {day.have_entries ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className={`text-sm font-medium ${!day.have_entries ? 'text-muted-foreground' : ''}`}>
                            {formatDate(day.day)}
                            {today && <span className="ml-1 text-xs text-primary">{t('recentDaysCard.today')}</span>}
                          </p>
                          {day.have_entries && day.daily_duration ? (
                            <p className="text-xs text-muted-foreground">
                              {t('recentDaysCard.logged', { hours: (day.daily_duration / 3600).toFixed(1) })}
                            </p>
                          ) : !day.have_entries ? (
                            <p className="text-xs text-muted-foreground">
                              {t('recentDaysCard.noEntries')}
                            </p>
                          ) : null}
                        </div>
                        {workDay && (
                          <Briefcase className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                    {!day.have_entries && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddEntry(day.day)}
                        className="text-xs"
                      >
                        {t('recentDaysCard.addEntry')}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddEntryModal
        isOpen={addModal.isOpen}
        onClose={handleCloseModal}
        onSuccess={handleAddSuccess}
        initialDate={addModal.selectedDate}
      />
    </>
  );
}