import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Entry } from "@/lib/types";
import { formatDateLong, formatTime, formatDuration } from "@/lib/utils";
import { Edit2, Trash2, Clock, Calendar, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: number, entryTitle: string) => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">{entry.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {entry.project_name || t('entriesTable.noProject')}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(entry.id, entry.title)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entry.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateLong(entry.entrie_date)}</span>
          </div>
          <Badge variant="secondary" className="font-mono text-base">
            {formatDuration(entry.duration)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(entry.datm_start)} - {formatTime(entry.datm_end)}
            {entry.datm_interval_start && (
              <span className="text-xs ml-2">({t('entriesTable.break', { start: formatTime(entry.datm_interval_start), end: formatTime(entry.datm_interval_end) })})</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 