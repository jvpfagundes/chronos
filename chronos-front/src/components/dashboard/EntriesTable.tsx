import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Clock, Loader2 } from "lucide-react";
import { useEntries } from "@/hooks/use-entries";
import { useDashboardFilter } from "@/hooks/use-dashboard-filter";
import { DateRange } from "@/components/dashboard/DashboardFilter";
import { formatDateLong, formatTime, formatDuration } from "@/lib/utils";
import { DeleteEntryModal } from "./DeleteEntryModal";
import { Entry } from "@/lib/types";
import { useTranslation } from "react-i18next";

export interface EntriesTableProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: number, entryTitle: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function EntriesTable({ entries, onEdit, onDelete, isLoading, error }: EntriesTableProps) {
  const { t } = useTranslation();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    entryId: number;
    entryTitle: string;
  }>({
    isOpen: false,
    entryId: 0,
    entryTitle: "",
  });

  const handleEdit = (entry: Entry) => {
    onEdit(entry);
  };

  const handleDelete = (entryId: number, entryTitle: string) => {
    onDelete(entryId, entryTitle);
  };

  const handleDeleteSuccess = () => {
    // This can now be handled by the parent component, 
    // but for now we'll just close the modal.
    handleCloseDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      entryId: 0,
      entryTitle: "",
    });
  };

  return (
      <>
        <Card className="chronos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>{t('entriesTable.recentEntries')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive text-sm">{t('entriesTable.errorLoading', { error: error })}</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('entriesTable.noEntriesFound')}</p>
                </div>
            ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden md:table-cell">{t('entriesTable.date')}</TableHead>
                        <TableHead>{t('entriesTable.title')}</TableHead>
                        <TableHead className="hidden lg:table-cell">{t('entriesTable.description')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('entriesTable.project')}</TableHead>
                        <TableHead className="hidden lg:table-cell">{t('entriesTable.time')}</TableHead>
                        <TableHead className="text-right">{t('entriesTable.duration')}</TableHead>
                        <TableHead className="w-[100px]">{t('entriesTable.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium hidden md:table-cell">
                              {formatDateLong(entry.entrie_date)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium max-w-[150px] md:max-w-[200px] truncate">{entry.title}</div>
                              <div className="flex flex-col space-y-1 mt-1 md:hidden">
                                <div className="text-sm text-muted-foreground">
                                  {formatDateLong(entry.entrie_date)}
                                </div>
                                <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light text-primary">
                              {entry.project_name || t('entriesTable.noProject')}
                            </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] lg:max-w-[300px] truncate hidden lg:table-cell">
                              {entry.description}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light text-primary">
                          {entry.project_name || t('entriesTable.noProject')}
                        </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                              <div>
                                <div>{formatTime(entry.datm_start)}–{formatTime(entry.datm_end)}</div>
                                {entry.datm_interval_start && entry.datm_interval_end && (
                                    <div className="text-xs text-muted-foreground">
                                      {t('entriesTable.break', { start: formatTime(entry.datm_interval_start), end: formatTime(entry.datm_interval_end) })}
                                    </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatDuration(entry.duration)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1 md:space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(entry)}
                                    className="h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                  <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(entry.id, entry.title)}
                                    className="h-7 w-7 md:h-8 md:w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>

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