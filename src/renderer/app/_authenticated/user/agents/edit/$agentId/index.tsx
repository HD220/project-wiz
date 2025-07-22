import { useMutation, useQueryClient } from "@tanstack/react-query";
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

function EditAgentPage() {
  const navigate = useNavigate();
  const { agent, providers } = Route.useLoaderData();
  const queryClient = useQueryClient();

  // Mutation for updating agent
  const updateMutation = useMutation({
    mutationFn: ({
      agentId,
      data,
    }: {
      agentId: string;
      data: CreateAgentInput;
    }) => window.api.agents.update(agentId, data),
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      handleClose();
    },
  });

  function handleClose() {
    navigate({ to: "/user/agents" });
  }

  async function handleSubmit(data: CreateAgentInput) {
    updateMutation.mutate({ agentId: (agent as SelectAgent).id, data });
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
        </DialogHeader>

        <AgentForm
          initialData={agent as SelectAgent}
          providers={providers as LlmProvider[]}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/agents/edit/$agentId/",
)({
  loader: async ({ params, context }) => {
    const { user } = context; // Access user from enhanced context
    const { agentId } = params;

    // Load agent data
    const agentResponse = await window.api.agents.get(agentId);
    if (!agentResponse.success) {
      throw new Error(agentResponse.error || "Failed to load agent");
    }

    // Load providers data for the form
    const providersResponse = await window.api.llmProviders.list(user!.id);
    if (!providersResponse.success) {
      throw new Error(providersResponse.error || "Failed to load providers");
    }

    return {
      agent: agentResponse.data as SelectAgent,
      providers: providersResponse.data as LlmProvider[],
      user,
    };
  },
  component: EditAgentPage,
});
