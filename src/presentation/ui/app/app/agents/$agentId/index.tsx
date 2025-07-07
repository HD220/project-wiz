import {
  createFileRoute,
  useRouter,
} from "@tanstack/react-router";

import { AgentDetailLoadingErrorDisplay } from "@/ui/features/agent/components/agent-detail-loading-error-display";
import { AgentDetailView } from "@/ui/features/agent/components/agent-detail-view";
import { useAgentInstanceDetails } from "@/ui/hooks/use-agent-instance-details.hook";
import { statusDisplayMap } from "@/ui/utils/agent-status";

function AgentInstanceDetailPage() {
  const { agentId, instance, isLoading, error } = useAgentInstanceDetails();

  const loadingErrorDisplay = AgentDetailLoadingErrorDisplay({ isLoading, error, agentId });

  if (loadingErrorDisplay) {
    return loadingErrorDisplay;
  }

  if (!instance) {
    return <div>No agent instance data available.</div>;
  }

  const statusInfo = statusDisplayMap[instance.status as keyof typeof statusDisplayMap] || statusDisplayMap.idle;

  return (
    <AgentDetailView
      instance={instance}
      statusInfo={statusInfo}
      agentId={agentId}
    />
  );
}

export const Route = createFileRoute("/app/agents/$agentId/")({
  component: AgentInstanceDetailPage,
});


