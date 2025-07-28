import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";

import { ProjectForm } from "./project-form";

interface CreateProjectDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
  className?: string;
}

export function CreateProjectDialog(props: CreateProjectDialogProps) {
  const { children, onSuccess, className } = props;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleSuccess(projectId: string) {
    setOpen(false);

    // Navigate to the new project
    navigate({
      to: "/project/$projectId",
      params: { projectId },
    });

    // Call optional success callback
    onSuccess?.();
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-md p-0 gap-0")}>
        {/* Discord-style header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Create Project
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Compact content area */}
        <div className="px-6 py-4">
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
            submitLabel="Create"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compound component exports
export const CreateProjectDialogTrigger = DialogTrigger;
