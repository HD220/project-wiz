import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useAgentStore } from "@/renderer/features/agent/agent.store";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";

function NewAgentPage() {
  const navigate = useNavigate();
  const { createAgent, isLoading } = useAgentStore();

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
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/_authenticated/user/agents/new/")({
  component: NewAgentPage,
});