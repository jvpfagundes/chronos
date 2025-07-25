import { useState } from "react";
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

export default function Entries() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date>();
  const [showAddModal, setShowAddModal] = useState(false);
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
      limit
  );

  const totalPages = Math.ceil(totalCount / limit);

  const handleAddSuccess = () => {
    // Invalidate queries or refetch data
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (entryId: number) => {
    // Logic to show an edit modal or navigate to an edit page
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

  return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Entries</h1>
            <p className="text-muted-foreground text-sm">
              Manage and track your time entries
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="outline"
                      className={cn(
                          "w-full md:w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                      )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Filter by date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  All Entries
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {entries.length > 0 ? offset + 1 : 0}-{Math.min(offset + limit, totalCount)} of {totalCount} entries
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">Error loading entries: {error}</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No entries found.</p>
                  <Button onClick={() => setShowAddModal(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Entry
                  </Button>
                </div>
            ) : (
                <>
                  {/* Mobile View */}
                  <div className="md:hidden">
                    <div className="space-y-4 p-4">
                      {entries.map((entry) => (
                          <div key={entry.id} className="bg-background border p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 space-y-1">
                                <p className="font-semibold text-foreground truncate pr-2">{entry.title}</p>
                                <p className="text-sm text-muted-foreground">{formatDateLong(entry.entrie_date)}</p>
                              </div>
                              <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(entry.id)} className="h-8 w-8">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id, entry.title)} className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-end">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                             {entry.project_name || "No Project"}
                           </span>
                              <p className="text-xl font-bold text-foreground">{formatDuration(entry.duration)}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden lg:table-cell">Project</TableHead>
                          <TableHead className="hidden lg:table-cell">Time</TableHead>
                          <TableHead className="text-right">Duration</TableHead>
                          <TableHead className="w-[100px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">{formatDateLong(entry.entrie_date)}</TableCell>
                              <TableCell>
                                <div className="font-medium max-w-[250px] truncate">{entry.title}</div>
                                <div className="text-muted-foreground text-xs max-w-[250px] truncate hidden lg:block">{entry.description}</div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {entry.project_name || "No Project"}
                          </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                                <div>{formatTime(entry.datm_start)}–{formatTime(entry.datm_end)}</div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{formatDuration(entry.duration)}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(entry.id)} className="h-8 w-8">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id, entry.title)} className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-4 pb-4 md:px-0 md:pb-0">
                        <div className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                          >
                            Next
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
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
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
