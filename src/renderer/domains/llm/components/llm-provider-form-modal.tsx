import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";
import { useLlmProviders } from "../hooks/use-llm-provider.hook";
import { useLlmProviderForm } from "../hooks/use-llm-provider-form.hook";
import { LlmProviderFormFields } from "./llm-provider-form-fields";

interface LlmProviderFormModalProps {
  provider: LlmProviderDto | null;
  onClose: () => void;
  isOpen: boolean;
}

export function LlmProviderFormModal({
  provider,
  onClose,
  isOpen,
}: LlmProviderFormModalProps) {
  const { createLlmProvider, updateLlmProvider } = useLlmProviders();
  const navigate = useNavigate();

  const {
    formData,
    selectedProvider,
    availableModels,
    handleFieldChange,
    handleProviderChange,
  } = useLlmProviderForm(provider);

  const handleSubmit = async () => {
    if (provider) {
      await updateLlmProvider({ id: provider.id, ...formData });
    } else {
      await createLlmProvider(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider ? "Edit" : "Add"} LLM Provider</DialogTitle>
        </DialogHeader>

        <LlmProviderFormFields
          formData={formData}
          selectedProvider={selectedProvider}
          availableModels={availableModels}
          onFieldChange={handleFieldChange}
          onProviderChange={handleProviderChange}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
