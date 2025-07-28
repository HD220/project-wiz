import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, Bot } from "lucide-react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

function NewAgentPage() {
  const navigate = useNavigate();
  const { providers } = Route.useLoaderData();

  // Get current search state from parent route to preserve filters
  const parentSearch = useSearch({ from: "/_authenticated/user/agents" });

  // Standardized mutation with automatic error handling
  const createAgentMutation = useApiMutation(
    (data: CreateAgentInput) => window.api.agents.create(data),
    {
      successMessage: "Agent created successfully",
      errorMessage: "Failed to create agent",
      onSuccess: () => handleBack(),
    },
  );

  function handleBack() {
    // Preserve user's current filter state when going back
    navigate({ to: "/user/agents", search: parentSearch });
  }

  async function handleSubmit(data: CreateAgentInput) {
    try {
      createAgentMutation.mutate(data);
    } catch (error) {
      // Error handling is done by useApiMutation
      // This catch prevents unhandled promise rejection
      console.error("Error in handleSubmit:", error);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button - Discord style */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Create New Agent</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-2xl">
          <AgentForm
            providers={providers}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            isLoading={createAgentMutation.isPending}
          />
        </div>
      </div>
    </div>
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
