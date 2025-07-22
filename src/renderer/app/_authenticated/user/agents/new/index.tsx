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
import { useAgentActions } from "@/renderer/features/agent/use-agent.hook";

function NewAgentPage() {
  const navigate = useNavigate();
  const { providers } = Route.useLoaderData();
  const { createAgent, isLoading } = useAgentActions();

  function handleClose() {
    navigate({ to: "/user/agents" });
  }

  async function handleSubmit(data: CreateAgentInput) {
    const success = await createAgent(data);
    if (success) {
      handleClose();
    }
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
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/_authenticated/user/agents/new/")({
  beforeLoad: ({ context }) => {
    const { auth } = context;
    if (!auth.user) {
      throw new Error("User not authenticated");
    }
  },
  loader: async ({ context }) => {
    const { auth } = context;
    const providersResponse = await window.api.llmProviders.list(auth.user!.id);
    if (!providersResponse.success) {
      throw new Error(providersResponse.error || "Failed to load providers");
    }

    return {
      providers: providersResponse.data as LlmProvider[],
    };
  },
  component: NewAgentPage,
});
