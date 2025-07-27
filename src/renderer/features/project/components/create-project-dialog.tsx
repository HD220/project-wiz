import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Folder } from "lucide-react";

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

function CreateProjectDialog(props: CreateProjectDialogProps) {
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
        className={cn("gap-6 p-6", dialogWidth, "max-h-[90vh] overflow-y-auto")}
        aria-describedby="create-project-description"
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Folder className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                Criar Novo Projeto
              </DialogTitle>
              <DialogDescription
                id="create-project-description"
                className="text-sm text-muted-foreground"
              >
                {isCompact
                  ? "Configure seu novo projeto"
                  : "Crie um novo projeto para organizar seu trabalho e colaborar com sua equipe. Escolha entre começar do zero ou clonar um repositório existente."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
            submitLabel={isCompact ? "Criar" : "Criar Projeto"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compound component pattern for better composition
const CreateProjectDialogTrigger = DialogTrigger;
const CreateProjectDialogContent = DialogContent;
const CreateProjectDialogHeader = DialogHeader;
const CreateProjectDialogTitle = DialogTitle;
const CreateProjectDialogDescription = DialogDescription;

// Export main component and compound parts
export {
  CreateProjectDialog,
  CreateProjectDialogTrigger,
  CreateProjectDialogContent,
  CreateProjectDialogHeader,
  CreateProjectDialogTitle,
  CreateProjectDialogDescription,
};

// Re-export for backwards compatibility
export { CreateProjectDialog as default };
