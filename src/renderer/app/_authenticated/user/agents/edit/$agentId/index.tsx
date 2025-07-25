import { createFileRoute, useNavigate } from "@tanstack/react-router";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import type {
  CreateAgentInput,
  SelectAgent,
} from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { loadApiData } from "@/renderer/lib/route-loader";

function EditAgentPage() {
  const navigate = useNavigate();
  const { agent, providers } = Route.useLoaderData();

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
    navigate({ to: "/user/agents", search: { showArchived: false } });
  }

  async function handleSubmit(data: CreateAgentInput): Promise<void> {
    updateAgentMutation.mutate(data);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
        </DialogHeader>

        <AgentForm
          initialData={agent as SelectAgent}
          providers={providers as LlmProvider[]}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={updateAgentMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/agents/edit/$agentId/",
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
