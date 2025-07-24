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

  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (entryId: number) => {

  };

  const handleDelete = (entryId: number, entryTitle: string) => {
    setDeleteModal({
      isOpen: true,
      entryId,
      entryTitle,
    });
  };

  const handleDeleteSuccess = () => {

  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      entryId: 0,
      entryTitle: "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">My Entries</h1>
          <p className="text-muted-foreground">
            Manage and track your time entries
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="chronos-card">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Filter by date"}
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

      {/* Entries Table */}
      <Card className="chronos-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>All Entries</span>
              </CardTitle>
              <CardDescription>
                Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount} entries
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="chronos-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
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
              <p className="text-muted-foreground">No entries found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatDateLong(entry.entrie_date)}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {entry.title}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {entry.description}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light text-primary">
                            {entry.project_name || "No Project"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id, entry.title)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
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
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Delete Entry Modal */}
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