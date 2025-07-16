import { Folder } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ProjectForm } from "@/components/forms/project-form";
import { useCreateProjectModal } from "../hooks/use-create-project-modal.hook";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    gitUrl,
    setGitUrl,
    isSubmitting,
    handleSubmit,
    resetForm,
  } = useCreateProjectModal();

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Criar Novo Projeto
          </DialogTitle>
          <DialogDescription>
            Configure um novo projeto para começar a trabalhar.
          </DialogDescription>
        </DialogHeader>

        <ProjectForm
          name={name}
          description={description}
          gitUrl={gitUrl}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onGitUrlChange={setGitUrl}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
