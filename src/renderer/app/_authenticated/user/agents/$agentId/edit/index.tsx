import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import type { LlmProvider } from "@/main/features/llm-provider/llm-provider.types";

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
import type {
  CreateAgentInput,
  SelectAgent,
} from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { loadApiData } from "@/renderer/lib/route-loader";

function EditAgentPage() {
  const navigate = useNavigate();
  const loaderData = Route.useLoaderData();
  const { agent, providers } = loaderData || { agent: null, providers: [] };

  // Get current search state from parent route to preserve filters
  const parentSearch = useSearch({ from: "/_authenticated/user/agents" });

  // Standardized mutation with automatic error handling
  const updateAgentMutation = useApiMutation(
    (data: CreateAgentInput) =>
      window.api.agents.update((agent as SelectAgent).id, data),
    {
      successMessage: "Agent updated successfully",
      errorMessage: "Failed to update agent",
      onSuccess: () => handleClose(),
    },
  );

  function handleClose() {
    // Navigate back to parent route, preserving search params
    navigate({ to: "/user/agents", search: parentSearch });
  }

  function handleSubmit(data: CreateAgentInput) {
    updateAgentMutation.mutate(data);
  }

  // Correct masked route implementation - single modal only
  return (
    <StandardFormModal
      open
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <StandardFormModalContent className="max-w-4xl">
        <StandardFormModalHeader
          title="Edit Agent"
          description="Update your AI agent configuration and settings"
        />

        <StandardFormModalBody>
          <AgentForm
            initialData={agent as SelectAgent}
            providers={providers as LlmProvider[]}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={updateAgentMutation.isPending}
          />
        </StandardFormModalBody>

        <StandardFormModalFooter>
          <StandardFormModalActions>
            <StandardFormModalCancelButton
              onCancel={handleClose}
              disabled={updateAgentMutation.isPending}
            >
              Cancel
            </StandardFormModalCancelButton>
            <StandardFormModalSubmitButton
              isSubmitting={updateAgentMutation.isPending}
              loadingText="Updating..."
              form="agent-form"
            >
              Update Agent
            </StandardFormModalSubmitButton>
          </StandardFormModalActions>
        </StandardFormModalFooter>
      </StandardFormModalContent>
    </StandardFormModal>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/agents/$agentId/edit/",
)({
  loader: async ({ params }) => {
    const { agentId } = params;

    // Load multiple API calls in parallel with standardized error handling
    const [agent, providers] = await Promise.all([
      loadApiData(() => window.api.agents.get(agentId), "Failed to load agent"),
      loadApiData(
        () => window.api.llmProviders.list(),
        "Failed to load providers",
      ),
    ]);

    return { agent, providers };
  },
  component: EditAgentPage,
});
