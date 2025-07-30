import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FolderIcon } from "lucide-react";

import {
  StandardFormModal,
  StandardFormModalContent,
  StandardFormModalHeader,
  StandardFormModalBody,
  StandardFormModalFooter,
  StandardFormModalActions,
  StandardFormModalCancelButton,
  StandardFormModalSubmitButton,
  StandardFormModalTrigger,
} from "@/renderer/components/form-modal";

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
    <StandardFormModal open={open} onOpenChange={handleOpenChange}>
      <StandardFormModalTrigger asChild className={className}>
        {children}
      </StandardFormModalTrigger>
      <StandardFormModalContent className="max-w-2xl">
        <StandardFormModalHeader
          title="Create Project"
          description="Start a new project workspace for your development tasks"
          icon={FolderIcon}
        />

        <StandardFormModalBody>
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
            submitLabel="Create"
            hideActions={true}
          />
        </StandardFormModalBody>

        <StandardFormModalFooter>
          <StandardFormModalActions>
            <StandardFormModalCancelButton onCancel={() => setOpen(false)}>
              Cancel
            </StandardFormModalCancelButton>
            <StandardFormModalSubmitButton form="project-form">
              Create Project
            </StandardFormModalSubmitButton>
          </StandardFormModalActions>
        </StandardFormModalFooter>
      </StandardFormModalContent>
    </StandardFormModal>
  );
}

// Compound component exports
export { StandardFormModalTrigger as CreateProjectDialogTrigger };
