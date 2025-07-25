import { createFileRoute, useNavigate } from "@tanstack/react-router";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

function NewAgentPage() {
  const navigate = useNavigate();
  const { providers } = Route.useLoaderData();

  // Standardized mutation with automatic error handling
  const createAgentMutation = useApiMutation(
    (data: CreateAgentInput) => window.api.agents.create(data),
    {
      successMessage: "Agent created successfully",
      errorMessage: "Failed to create agent",
      onSuccess: () => handleClose(),
    },
  );

  function handleClose() {
    navigate({ to: "/user/agents", search: { showArchived: false } });
  }

  async function handleSubmit(data: CreateAgentInput) {
    createAgentMutation.mutate(data);
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>

        <AgentForm
          providers={providers}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={createAgentMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/_authenticated/user/agents/new/")({
  loader: async ({ context }) => {
    const { auth } = context;

    // Defensive check - ensure user exists
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    const providersResponse = await window.api.llmProviders.list();
    if (!providersResponse.success) {
      throw new Error(providersResponse.error || "Failed to load providers");
    }

    return {
      providers: providersResponse.data as LlmProvider[],
    };
  },
  component: NewAgentPage,
});
