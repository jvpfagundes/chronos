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

export function EntriesTable() {
  const { dateRange } = useDashboardFilter();
  const { entries, isLoading, error, refetch } = useEntries(dateRange);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    entryId: number;
    entryTitle: string;
  }>({
    isOpen: false,
    entryId: 0,
    entryTitle: "",
  });

  const handleEdit = (entryId: number) => {
    // TODO: Implement edit functionality
  };

  const handleDelete = (entryId: number, entryTitle: string) => {
    setDeleteModal({
      isOpen: true,
      entryId,
      entryTitle,
    });
  };

  const handleDeleteSuccess = () => {
    refetch();
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
              <span>Recent Entries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive text-sm">Error loading entries: {error}</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No entries found for this period</p>
                </div>
            ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden lg:table-cell">Description</TableHead>
                        <TableHead className="hidden md:table-cell">Project</TableHead>
                        <TableHead className="hidden lg:table-cell">Time</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
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
                              {entry.project_name || "No Project"}
                            </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] lg:max-w-[300px] truncate hidden lg:table-cell">
                              {entry.description}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light text-primary">
                          {entry.project_name || "No Project"}
                        </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                              <div>
                                <div>{formatTime(entry.datm_start)}–{formatTime(entry.datm_end)}</div>
                                {entry.datm_interval_start && entry.datm_interval_end && (
                                    <div className="text-xs text-muted-foreground">
                                      Break: {formatTime(entry.datm_interval_start)}–{formatTime(entry.datm_interval_end)}
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
                                    onClick={() => handleEdit(entry.id)}
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