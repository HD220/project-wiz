import { Dialog, DialogContent } from "../../../../components/ui/dialog";
import { useLlmProviders } from "../../../llm/hooks/use-llm-provider.hook";
import { useAddAgentForm } from "../hooks/use-add-agent-form.hook";
import { useAddAgentSubmit } from "../hooks/use-add-agent-submit.hook";
import { AddAgentModalHeader } from "./add-agent-modal-header";
import { AddAgentFormTabs } from "./add-agent-form-tabs";
import { AddAgentFormError } from "./add-agent-form-error";
import { AddAgentFormActions } from "./add-agent-form-actions";

interface AddAgentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onAgentAdded?: (agent: any) => void;
}

export function AddAgentModal({
  isOpen,
  onOpenChange,
  projectId,
  onAgentAdded,
}: AddAgentModalProps) {
  const { providers: llmProviders } = useLlmProviders();
  const form = useAddAgentForm();
  const { handleSubmit } = useAddAgentSubmit({
    form,
    onAgentAdded,
    onOpenChange,
    isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AddAgentModalHeader />
        <form onSubmit={handleSubmit}>
          <AddAgentFormTabs
            formData={form.formData}
            updateField={form.updateField}
            llmProviders={llmProviders || []}
          />
          <AddAgentFormError error={form.error} />
          <AddAgentFormActions
            isSubmitting={form.isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
