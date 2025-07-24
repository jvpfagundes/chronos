import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dashboardService } from "@/lib/dashboard-service";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entryId: number;
  entryTitle: string;
}

export function DeleteEntryModal({ isOpen, onClose, onSuccess, entryId, entryTitle }: DeleteEntryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await dashboardService.deleteEntry(entryId);
      
      toast({
        title: "Entry deleted",
        description: "The entry has been successfully deleted.",
      });
      
      onSuccess();
      onClose();
      

      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['entries-total-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete entry. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete Entry</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the entry "{entryTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 