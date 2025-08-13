import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Bot, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { loadApiData } from "@/renderer/lib/route-loader";

import { getRendererLogger } from "@/shared/services/logger/renderer";
import type { LlmProvider, Agent } from "@/shared/types";

const logger = getRendererLogger("agent-new");

// Create agent input type derived from Agent
type CreateAgentInput = Pick<
  Agent,
  "name" | "role" | "backstory" | "goal" | "providerId" | "modelConfig"
>;

function CreateAgentPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  // Load providers when page mounts
  useEffect(() => {
    async function loadProviders() {
      try {
        const providersData = await loadApiData(
          () => window.api.llmProvider.list({}),
          "Failed to load providers",
        );
        setProviders(providersData as LlmProvider[]);
      } catch (error) {
        logger.error("Error loading providers:", error);
      } finally {
        setIsLoadingProviders(false);
      }
    }

    loadProviders();
  }, []);

  // Agent creation mutation
  const createAgentMutation = useApiMutation(
    (data: CreateAgentInput) => window.api.agent.create(data),
    {
      successMessage: "Agent created successfully",
      errorMessage: "Failed to create agent",
      invalidateRouter: true,
      onSuccess: () => {
        handleClose();
      },
    },
  );

  function handleClose() {
    // Navigate back to previous page
    router.history.back();
  }

  function handleSubmit(data: CreateAgentInput) {
    createAgentMutation.mutate(data);
  }

  function handleCancel() {
    handleClose();
  }

  // Correct masked route implementation - single modal only
  return (
    <StandardFormModal
      open
      onOpenChange={(open: boolean) => !open && handleClose()}
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
            <StandardFormModalBody>
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

export const Route = createFileRoute("/_authenticated/user/agents/new/")({
  component: CreateAgentPage,
});
