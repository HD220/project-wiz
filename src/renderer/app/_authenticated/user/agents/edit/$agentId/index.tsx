import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

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
  const router = useRouter();
  const { agent, providers } = Route.useLoaderData();

  function handleClose() {
    navigate({ to: "/user/agents" });
  }

  async function handleSubmit(data: CreateAgentInput) {
    try {
      const response = await window.api.agents.update(
        (agent as SelectAgent).id,
        data,
      );
      if (response.success) {
        // Invalidate route to refresh data
        router.invalidate();
        handleClose();
      } else {
        // Handle error - could show toast here
        console.error("Failed to update agent:", response.error);
      }
    } catch (error) {
      console.error("Error updating agent:", error);
    }
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
          isLoading={false}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/agents/edit/$agentId/",
)({
  loader: async ({ params, context }) => {
    const { auth } = context;
    const { agentId } = params;

    // Load agent data
    const agentResponse = await window.api.agents.get(agentId);
    if (!agentResponse.success) {
      throw new Error(agentResponse.error || "Failed to load agent");
    }

    // Load providers data for the form
    const providersResponse = await window.api.llmProviders.list(auth.user!.id);
    if (!providersResponse.success) {
      throw new Error(providersResponse.error || "Failed to load providers");
    }

    return {
      agent: agentResponse.data as SelectAgent,
      providers: providersResponse.data as LlmProvider[],
    };
  },
  component: EditAgentPage,
});
