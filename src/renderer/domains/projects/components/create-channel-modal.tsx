import { Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ChannelFormFields } from "./channel-form-fields";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Criar Novo Canal
          </DialogTitle>
          <DialogDescription>
            Adicione um novo canal ao seu projeto para organizar conversas e
            atividades.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <ChannelFormFields
            channelName={channelName}
            channelDescription={channelDescription}
            channelType={channelType}
            isPrivate={isPrivate}
            onFieldChange={handleFieldChange}
          />

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!channelName.trim() || isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Canal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
