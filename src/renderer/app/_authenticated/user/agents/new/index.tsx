import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { toast } from "sonner";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";

function NewAgentPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { providers } = Route.useLoaderData();

  // SIMPLE: Direct mutation with window.api
  const createAgentMutation = useMutation({
    mutationFn: (data: CreateAgentInput) => window.api.agents.create(data),
    onSuccess: () => {
      toast.success("Agent created successfully");
      router.invalidate(); // Refresh agents list
      handleClose();
    },
    onError: () => {
      toast.error("Failed to create agent");
    },
  });

  function handleClose() {
    navigate({ to: "/user/agents" });
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
    const { user } = context; // Access user from enhanced context
    const providersResponse = await window.api.llmProviders.list(user.id);
    if (!providersResponse.success) {
      throw new Error(providersResponse.error || "Failed to load providers");
    }

    return {
      providers: providersResponse.data as LlmProvider[],
    };
  },
  component: NewAgentPage,
});
