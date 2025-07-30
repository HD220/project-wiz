import { Bot, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import type { LlmProvider } from "@/renderer/features/agent/provider.types";

import {
  StandardFormModal,
  StandardFormModalContent,
  StandardFormModalHeader,
  StandardFormModalBody,
  StandardFormModalFooter,
  StandardFormModalActions,
  StandardFormModalCancelButton,
  StandardFormModalSubmitButton,
} from "@/renderer/components/form-modal";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onAgentCreated?: () => void;
}

export function CreateAgentDialog(props: CreateAgentDialogProps) {
  const { open, onClose, onAgentCreated } = props;
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Load providers when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadProviders() {
      setIsLoadingProviders(true);
      try {
        const response = await window.api.llmProviders.list();
        if (response.success) {
          setProviders(response.data as LlmProvider[]);
        } else {
          console.error("Failed to load providers:", response.error);
        }
      } catch (error) {
        console.error("Error loading providers:", error);
      } finally {
        setIsLoadingProviders(false);
      }
    }

    loadProviders();
  }, [open]);

  // Agent creation mutation
  const createAgentMutation = useApiMutation(
    (data: CreateAgentInput) => window.api.agents.create(data),
    {
      successMessage: "Agent created successfully",
      errorMessage: "Failed to create agent",
      invalidateRouter: true,
      onSuccess: () => {
        onClose();
        onAgentCreated?.();
      },
    },
  );

  function handleClose() {
    // Don't close if mutation is pending
    if (createAgentMutation.isPending) return;
    onClose();
  }

  async function handleSubmit(data: CreateAgentInput) {
    try {
      createAgentMutation.mutate(data);
    } catch (error) {
      // Error handling is done by useApiMutation
      console.error("Error in handleSubmit:", error);
    }
  }

  function handleCancel() {
    handleClose();
  }

  return (
    <StandardFormModal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
    >
      <StandardFormModalContent className="max-w-4xl">
        <StandardFormModalHeader
          title="Create New Agent"
          description="Configure a new AI agent to help with your projects and tasks"
          icon={Bot}
        />

        {isLoadingProviders ? (
          <StandardFormModalBody>
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading providers...
              </p>
            </div>
          </StandardFormModalBody>
        ) : (
          <>
            <StandardFormModalBody maxHeight="70vh">
              <AgentForm
                providers={providers}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createAgentMutation.isPending}
              />
            </StandardFormModalBody>

            <StandardFormModalFooter>
              <StandardFormModalActions>
                <StandardFormModalCancelButton
                  onCancel={handleCancel}
                  disabled={createAgentMutation.isPending}
                >
                  Cancel
                </StandardFormModalCancelButton>
                <StandardFormModalSubmitButton
                  isSubmitting={createAgentMutation.isPending}
                  loadingText="Creating..."
                  form="agent-form"
                >
                  Create Agent
                </StandardFormModalSubmitButton>
              </StandardFormModalActions>
            </StandardFormModalFooter>
          </>
        )}
      </StandardFormModalContent>
    </StandardFormModal>
  );
}
