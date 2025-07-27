import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { EmptyState } from "@/renderer/features/llm-provider/components/empty-state";
import { ProviderCard } from "@/renderer/features/llm-provider/components/provider-card";

interface ProviderListProps {
  providers: LlmProvider[];
}

export function ProviderList(props: ProviderListProps) {
  const { providers } = props;

  if (providers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Configured Providers</h3>
            {providers.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({providers.length})
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your AI language model providers
          </p>
        </div>
        <Link
          to="/user/settings/llm-providers/$providerId/new"
          params={{ providerId: "new" }}
        >
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
        </Link>
      </div>

      {/* Providers List */}
      <div className="space-y-2">
        {providers.map((provider: LlmProvider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
