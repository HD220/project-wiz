import { useNavigate } from "@tanstack/react-router";
import { Folder, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { cn } from "@/renderer/lib/utils";

import { ProjectForm } from "./project-form";

interface CreateProjectDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
  variant?: "default" | "compact";
  className?: string;
}

export function CreateProjectDialog(props: CreateProjectDialogProps) {
  const { children, onSuccess, variant = "default", className } = props;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleSuccess(projectId: string) {
    setOpen(false);

    // Navigate to the new project with loading state
    navigate({
      to: "/project/$projectId",
      params: { projectId },
    });

    // Call optional success callback
    onSuccess?.();
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    // Reset form state when dialog closes
    if (!newOpen) {
      // Form will reset automatically on unmount
    }
  }

  const isCompact = variant === "compact";
  const dialogWidth = isCompact ? "sm:max-w-[400px]" : "sm:max-w-[600px]";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "gap-0 p-0 border-2 shadow-2xl",
          dialogWidth,
          "max-h-[90vh] overflow-hidden",
        )}
        aria-describedby="create-project-description"
      >
        {/* Enhanced Header with gradient background */}
        <DialogHeader className="relative p-6 pb-4 bg-gradient-to-br from-primary/5 via-primary/10 to-background border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20 shadow-sm">
                <Folder className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Create New Project
              </DialogTitle>
              <DialogDescription
                id="create-project-description"
                className="text-base text-muted-foreground leading-relaxed"
              >
                {isCompact
                  ? "Set up your new project"
                  : "Create a new project to organize your work and collaborate with your team. Choose between starting from scratch or cloning an existing repository."}
              </DialogDescription>
            </div>
            {!isCompact && (
              <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/30">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Enhanced Content Area */}
        <div className="p-6 pt-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
            submitLabel={isCompact ? "Create" : "Create Project"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compound component pattern for better composition
export const CreateProjectDialogTrigger = DialogTrigger;
export const CreateProjectDialogContent = DialogContent;
export const CreateProjectDialogHeader = DialogHeader;
export const CreateProjectDialogTitle = DialogTitle;
export const CreateProjectDialogDescription = DialogDescription;
