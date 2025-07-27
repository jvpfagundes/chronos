import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Plus, CalendarIcon, Search, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn, formatDateLong, formatTime, formatDuration } from "@/lib/utils";
import { useEntriesPaginated } from "@/hooks/use-entries";
import { AddEntryModal } from "@/components/dashboard/AddEntryModal";
import { DeleteEntryModal } from "@/components/dashboard/DeleteEntryModal";
import { Entry } from "@/lib/types";
import { EntriesTable } from "@/components/dashboard/EntriesTable";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/use-mobile";
import { EntryCard } from "@/components/dashboard/EntryCard";

export default function Entries() {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
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

  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const { entries, totalCount, isLoading, error } = useEntriesPaginated(
      offset,
      limit,
      debouncedSearchTerm,
      dateRange
  );

  const totalPages = Math.ceil(totalCount / limit);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange]);


  const handleAddSuccess = () => {
    // Invalidate queries or refetch data
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  const handleDeleteSuccess = () => {
    // Invalidate queries or refetch data
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      entryId: 0,
      entryTitle: "",
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
  }

  return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("entries.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("entries.description")}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  {t("entries.allEntries")}
                </CardTitle>
                <CardDescription className="mt-1">
                  {t("entries.showingEntries", { from: entries.length > 0 ? offset + 1 : 0, to: Math.min(offset + limit, totalCount), total: totalCount })}
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <Input
                    placeholder={t("entries.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full md:w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{t("entries.pickDateRange")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("entries.addEntry")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{t("entries.errorLoading", { error: error })}</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("entries.noEntriesFound")}</p>
                  <Button onClick={() => setShowAddModal(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("entries.addFirstEntry")}
                  </Button>
                </div>
            ) : (
                <>
                  {isMobile ? (
                    <div className="space-y-4 p-4">
                      {entries.map((entry) => (
                        <EntryCard
                          key={entry.id}
                          entry={entry}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                        <EntriesTable
                            entries={entries}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>
                  )}

                  {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-4 pb-4 md:px-0 md:pb-0">
                        <div className="text-sm text-muted-foreground">
                          {t("entries.pageOf", { currentPage: currentPage, totalPages: totalPages })}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t("entries.prev")}
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                          >
                            {t("entries.next")}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                  )}
                </>
            )}
          </CardContent>
        </Card>

        <AddEntryModal
            isOpen={showAddModal}
            onClose={handleCloseModal}
            onSuccess={handleAddSuccess}
            entryToEdit={editingEntry}
        />

        <DeleteEntryModal
            isOpen={deleteModal.isOpen}
            onClose={handleCloseDeleteModal}
            onSuccess={handleDeleteSuccess}
            entryId={deleteModal.entryId}
            entryTitle={deleteModal.entryTitle}
        />
      </div>
  );
}
