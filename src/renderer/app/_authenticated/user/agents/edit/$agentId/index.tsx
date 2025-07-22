import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { AgentForm } from "@/renderer/features/agent/components/agent-form";
import { useAgentStore } from "@/renderer/features/agent/agent.store";
import type { CreateAgentInput } from "@/renderer/features/agent/agent.types";

function EditAgentPage() {
  const navigate = useNavigate();
  const { agentId } = useParams({ from: "/_authenticated/user/agents/edit/$agentId/" });
  const { selectedAgent, getAgent, updateAgent, isLoading } = useAgentStore();

  useEffect(() => {
    if (agentId) {
      getAgent(agentId);
    }
  }, [agentId, getAgent]);

  function handleClose() {
    navigate({ to: "/user/agents" });
  }

  async function handleSubmit(data: CreateAgentInput) {
    if (agentId) {
      const success = await updateAgent(agentId, data);
      if (success) {
        handleClose();
      }
    }
  }

  if (!selectedAgent) {
    return (
      <Dialog open onOpenChange={handleClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading agent...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
        </DialogHeader>
        
        <AgentForm
          initialData={selectedAgent}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/_authenticated/user/agents/edit/$agentId/")({
  component: EditAgentPage,
});