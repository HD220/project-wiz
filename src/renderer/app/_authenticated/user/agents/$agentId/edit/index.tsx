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

  async function handleSubmit(data: CreateAgentInput): Promise<void> {
    updateAgentMutation.mutate(data);
  }

  // Modal overlay implementation for masked route
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <StandardFormModal
          open
          onOpenChange={(open: boolean) => !open && handleClose()}
        >
          <StandardFormModalContent className="max-w-4xl relative z-10">
            <StandardFormModalHeader
              title="Edit Agent"
              description="Update your AI agent configuration and settings"
            />

            <StandardFormModalBody maxHeight="70vh">
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
      </div>
    </>
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
