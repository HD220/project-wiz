import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { useAgents } from "../../../agents/hooks/use-agents.hook";
import { useLlmProviders } from "../../../llm/hooks/use-llm-provider.hook";
import { useAddAgentForm } from "../hooks/use-add-agent-form.hook";
import { AddAgentModalHeader } from "./add-agent-modal-header";
import { AddAgentBasicFields } from "./add-agent-basic-fields";
import { AddAgentAdvancedFields } from "./add-agent-advanced-fields";

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
  const { createAgent } = useAgents();
  const { providers: llmProviders } = useLlmProviders();
  const form = useAddAgentForm();

  useEffect(() => {
    if (!isOpen) {
      form.resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = form.validateForm();
    if (validationError) {
      form.setError(validationError);
      return;
    }

    form.setIsSubmitting(true);
    form.setError(null);

    try {
      const agent = await createAgent(form.formData);
      onAgentAdded?.(agent);
      onOpenChange(false);
    } catch (err) {
      form.setError(
        err instanceof Error ? err.message : "Erro ao criar agente",
      );
    } finally {
      form.setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AddAgentModalHeader />

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="advanced">
                Configurações Avançadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <AddAgentBasicFields
                formData={form.formData}
                updateField={form.updateField}
                llmProviders={llmProviders || []}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <AddAgentAdvancedFields
                formData={form.formData}
                updateField={form.updateField}
              />
            </TabsContent>
          </Tabs>

          {form.error && (
            <div className="text-destructive text-sm mt-4">{form.error}</div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Criar Agente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
