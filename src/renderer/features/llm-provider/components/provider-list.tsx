import { Link } from "@tanstack/react-router";
import { Plus, Settings, Server } from "lucide-react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
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

  // Inline statistics calculation following INLINE-FIRST principles
  const activeProviders = providers.filter((p) => p.isActive).length;
  const defaultProvider = providers.find((p) => p.isDefault);

  return (
    <div className="flex flex-col h-full">
      {/* Professional Agent-style Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              LLM Providers
            </h1>
            <p className="text-sm text-muted-foreground">
              {providers.length} providers • {activeProviders} active
              {defaultProvider && ` • Default: ${defaultProvider.name}`}
            </p>
          </div>
        </div>
        <Link
          to="/user/settings/llm-providers/$providerId/new"
          params={{ providerId: "new" }}
        >
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Provider
          </Button>
        </Link>
      </div>

      {/* Scrollable Provider List with responsive 2-column layout */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-1">
            {providers.map((provider: LlmProvider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
