import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateChannelModalHeader } from "./create-channel-modal-header";
import { CreateChannelModalForm } from "./create-channel-modal-form";
import { useChannelForm } from "../hooks/use-channel-form.hook";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CreateChannelModal({
  open,
  onOpenChange,
  projectId,
}: CreateChannelModalProps) {
  const {
    channelName,
    channelDescription,
    channelType,
    isPrivate,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    resetForm,
  } = useChannelForm(projectId);

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <CreateChannelModalHeader />
        <CreateChannelModalForm
          channelName={channelName}
          channelDescription={channelDescription}
          channelType={channelType}
          isPrivate={isPrivate}
          isSubmitting={isSubmitting}
          error={error}
          onFieldChange={handleFieldChange}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}