import { useEffect } from "react";

// Local type definitions - only using for type inference from stores

import { useAgentStore } from "@/renderer/store/agent-store";
import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

import { AgentCard } from "@/components/agent-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface AgentListProps {
  userId: string;
}

export function AgentList({ userId }: AgentListProps) {
  const { agents, isLoading, error, loadAgents } = useAgentStore();
  const { providers, loadProviders } = useLlmProviderStore();

  useEffect(() => {
    loadAgents();
    loadProviders(userId);
  }, [loadAgents, loadProviders, userId]);

  const getProviderName = (providerId: string): string => {
    const provider = providers.find((p) => p.id === providerId);
    return provider ? provider.name : "Unknown Provider";
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load agents: {error}</AlertDescription>
      </Alert>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No agents yet</h3>
          <p className="mt-2 text-muted-foreground">
            Create your first AI agent to start collaborating with autonomous
            team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Your Agents ({agents.length})</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>
            {agents.filter((a) => a.status === "active").length} active
          </span>
          <span>•</span>
          <span>
            {agents.filter((a) => a.status === "inactive").length} inactive
          </span>
          {agents.filter((a) => a.status === "busy").length > 0 && (
            <>
              <span>•</span>
              <span>
                {agents.filter((a) => a.status === "busy").length} busy
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            providerName={getProviderName(agent.providerId)}
          />
        ))}
      </div>
    </div>
  );
}
