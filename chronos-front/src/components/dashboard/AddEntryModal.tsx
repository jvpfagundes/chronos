import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { dashboardService } from "@/lib/dashboard-service";
import { Project, CreateEntryRequest, CreateProjectRequest, Entry } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

function TimeInput({ value, onChange, placeholder = "00:00", label }: TimeInputProps) {
  const formatTimeInput = (input: string): string => {

    const numbers = input.replace(/\D/g, '');
    

    const limited = numbers.slice(0, 4);
    

    if (limited.length >= 3) {
      const hours = limited.slice(0, 2);
      const minutes = limited.slice(2, 4);
      return `${hours}:${minutes}`;
    } else if (limited.length >= 1) {
      return limited;
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    onChange(formatted);
  };

  const handleBlur = () => {

    if (value && value.length < 5) {
      const parts = value.split(':');
      if (parts.length === 1) {

        const hours = parts[0].padStart(2, '0');
        onChange(`${hours}:00`);
      } else if (parts.length === 2) {

        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        onChange(`${hours}:${minutes}`);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="font-mono text-center"
      />
    </div>
  );
}

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date | null;
  entryToEdit?: Entry | null;
}

export function AddEntryModal({ isOpen, onClose, onSuccess, initialDate, entryToEdit }: AddEntryModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  
  const initialFormData = {
    date: new Date(),
    title: "",
    description: "",
    projectId: "",
    startTime: "",
    intervalStartTime: "",
    intervalEndTime: "",
    endTime: "",
  };

  // Form data
  const [formData, setFormData] = useState(initialFormData);

  // New project form
  const [newProjectName, setNewProjectName] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditMode = !!entryToEdit;

  // Load projects on mount
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  // Set initial date when provided
  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({ ...prev, date: initialDate }));
    }
  }, [initialDate]);

  useEffect(() => {
    if (isEditMode && entryToEdit) {
      const project = projects.find(p => p.name === entryToEdit.project_name);
      setFormData({
        date: new Date(entryToEdit.entrie_date),
        title: entryToEdit.title,
        description: entryToEdit.description || "",
        projectId: project ? project.id.toString() : "",
        startTime: format(new Date(entryToEdit.datm_start), "HH:mm"),
        endTime: format(new Date(entryToEdit.datm_end), "HH:mm"),
        intervalStartTime: entryToEdit.datm_interval_start ? format(new Date(entryToEdit.datm_interval_start), "HH:mm") : "",
        intervalEndTime: entryToEdit.datm_interval_end ? format(new Date(entryToEdit.datm_interval_end), "HH:mm") : "",
      });
    } else {
      const newFormData = { ...initialFormData };
      if (initialDate) {
        newFormData.date = initialDate;
      }
      setFormData(newFormData);
    }
  }, [entryToEdit, isEditMode, isOpen, initialDate, projects]);


  const loadProjects = async () => {
    try {
      const response = await dashboardService.getProjects();
      setProjects(response.projects_list);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('addEntryModal.failedToLoadProjects');
      toast({
        title: t("addEntryModal.error"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: t("addEntryModal.error"),
        description: t("addEntryModal.projectNameRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProject(true);
    try {
      const projectData: CreateProjectRequest = { name: newProjectName.trim() };
      await dashboardService.createProject(projectData);
      
      toast({
        title: t("addEntryModal.success"),
        description: t("addEntryModal.projectCreated"),
      });
      
      // Reload projects
      const response = await dashboardService.getProjects();
      setProjects(response.projects_list);
      
      // Find and select the newly created project
      const newProject = response.projects_list.find(p => p.name === newProjectName.trim());
      if (newProject) {
        setFormData(prev => ({ ...prev, projectId: newProject.id.toString() }));
      }
      
      setShowNewProjectForm(false);
      setNewProjectName("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('addEntryModal.failedToCreateProject');
      toast({
        title: t("addEntryModal.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: t("addEntryModal.error"),
        description: t("addEntryModal.titleIsRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.projectId) {
      toast({
        title: t("addEntryModal.error"),
        description: t("addEntryModal.projectIsRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast({
        title: t("addEntryModal.error"),
        description: t("addEntryModal.timesAreRequired"),
        variant: "destructive",
      });
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      toast({
        title: t("addEntryModal.error"),
        description: t("addEntryModal.invalidTimeFormat"),
        variant: "destructive",
      });
      return;
    }

    // Validate time order
    if (formData.startTime >= formData.endTime) {
      toast({
        title: t("addEntryModal.error"),
        description: t("addEntryModal.endTimeAfterStartTime"),
        variant: "destructive",
      });
      return;
    }

    // Validate interval times if provided
    if (formData.intervalStartTime && formData.intervalEndTime) {
      if (!timeRegex.test(formData.intervalStartTime) || !timeRegex.test(formData.intervalEndTime)) {
        toast({
          title: t("addEntryModal.error"),
          description: t("addEntryModal.invalidIntervalTimeFormat"),
          variant: "destructive",
        });
        return;
      }

      if (formData.intervalStartTime >= formData.intervalEndTime) {
        toast({
          title: t("addEntryModal.error"),
          description: t("addEntryModal.intervalEndTimeAfterStartTime"),
          variant: "destructive",
        });
        return;
      }

      if (formData.intervalStartTime <= formData.startTime || formData.intervalEndTime >= formData.endTime) {
        toast({
          title: t("addEntryModal.error"),
          description: t("addEntryModal.intervalWithinTaskTime"),
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const dateStr = format(formData.date, 'yyyy-MM-dd');

      const entryPayload: CreateEntryRequest = {
        date: dateStr,
        datm_start: `${dateStr}T${formData.startTime}:00`,
        datm_end: `${dateStr}T${formData.endTime}:00`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        project_id: parseInt(formData.projectId),
      };

      if (formData.intervalStartTime) {
        entryPayload.datm_interval_start = `${dateStr}T${formData.intervalStartTime}:00`;
      }
      if (formData.intervalEndTime) {
        entryPayload.datm_interval_end = `${dateStr}T${formData.intervalEndTime}:00`;
      }

      if (isEditMode && entryToEdit) {
        // PUT logic for editing
        await dashboardService.updateEntry(entryToEdit.id, entryPayload);
        toast({
          title: t("addEntryModal.success"),
          description: t("addEntryModal.entryUpdated"),
        });
      } else {
        // POST logic for creating
        await dashboardService.createEntry(entryPayload);
        toast({
          title: t("addEntryModal.success"),
          description: t("addEntryModal.entryCreated"),
        });
      }

      // Common success logic
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['entries-total-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      onSuccess();
      handleClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(isEditMode ? 'addEntryModal.failedToUpdateEntry' : 'addEntryModal.failedToCreateEntry');
      toast({
        title: t("addEntryModal.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData(initialFormData);
      setShowNewProjectForm(false);
      setNewProjectName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('addEntryModal.editTitle') : t('addEntryModal.addTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>{t('addEntryModal.dateLabel')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : t('addEntryModal.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('addEntryModal.titleLabel')}</Label>
              <Input
                id="title"
                placeholder={t('addEntryModal.titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('addEntryModal.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('addEntryModal.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label>{t('addEntryModal.projectLabel')}</Label>
            <div className="flex space-x-2">
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('addEntryModal.selectProjectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowNewProjectForm(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* New Project Form */}
          {showNewProjectForm && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label htmlFor="newProject">{t('addEntryModal.newProjectNameLabel')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="newProject"
                  placeholder={t('addEntryModal.newProjectNamePlaceholder')}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={isCreatingProject}
                  size="sm"
                >
                  {isCreatingProject ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('addEntryModal.createButton')
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewProjectForm(false);
                    setNewProjectName("");
                  }}
                  size="sm"
                >
                  {t('addEntryModal.cancelButton')}
                </Button>
              </div>
            </div>
          )}

          {/* Time Fields */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TimeInput
              label={t('addEntryModal.startTimeLabel')}
              value={formData.startTime}
              onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
              placeholder="09:00"
            />
            <TimeInput
              label={t('addEntryModal.intervalStartLabel')}
              value={formData.intervalStartTime}
              onChange={(value) => setFormData(prev => ({ ...prev, intervalStartTime: value }))}
              placeholder="12:00"
            />
            <TimeInput
              label={t('addEntryModal.intervalEndLabel')}
              value={formData.intervalEndTime}
              onChange={(value) => setFormData(prev => ({ ...prev, intervalEndTime: value }))}
              placeholder="13:00"
            />
            <TimeInput
              label={t('addEntryModal.endTimeLabel')}
              value={formData.endTime}
              onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
              placeholder="17:00"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('addEntryModal.cancelButton')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="chronos-button-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? t('addEntryModal.saving') : t('addEntryModal.creating')}
                </>
              ) : (
                isEditMode ? t('addEntryModal.saveChangesButton') : t('addEntryModal.createEntryButton')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 