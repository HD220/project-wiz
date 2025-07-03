import {
  createFileRoute,
  useRouter,
} from "@tanstack/react-router";

import { AgentDetailLoadingErrorDisplay } from "@/ui/features/agent/components/AgentDetailLoadingErrorDisplay";
import { AgentDetailView } from "@/ui/features/agent/components/AgentDetailView";
import { useAgentInstanceDetails } from "@/ui/hooks/useAgentInstanceDetails";
import { statusDisplayMap } from "@/ui/utils/agent-status";

function AgentInstanceDetailPage() {
  const router = useRouter();
  const { agentId, instance, isLoading, error } = useAgentInstanceDetails();

  const loadingErrorDisplay = AgentDetailLoadingErrorDisplay({ isLoading, error, agentId });

  if (loadingErrorDisplay) {
    return loadingErrorDisplay;
  }

  const statusInfo = instance ? statusDisplayMap[instance.status] || statusDisplayMap.idle : statusDisplayMap.idle;

  return (
    <AgentDetailView
      instance={instance!}
      statusInfo={statusInfo}
      agentId={agentId}
      router={router}
    />
  );
}

export const Route = createFileRoute("/app/agents/$agentId/")({
  component: AgentInstanceDetailPage,
});


