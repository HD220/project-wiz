import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useCreateProjectModal } from "../hooks/use-create-project-modal.hook";
import { CreateProjectModalHeader } from "./create-project-modal-header";
import { CreateProjectModalForm } from "./create-project-modal-form";

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
        <CreateProjectModalHeader />
        <CreateProjectModalForm
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
