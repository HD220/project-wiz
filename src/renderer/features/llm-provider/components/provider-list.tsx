import { Link } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";

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
      {/* Compact Discord-style Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              AI Providers
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
              {providers.length}
            </span>
            {activeProviders > 0 && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                  {activeProviders} active
                </span>
              </>
            )}
          </div>
        </div>

        <Link
          to="/user/settings/llm-providers/$providerId/new"
          params={{ providerId: "new" }}
        >
          <Button size="sm" className="gap-1.5 h-8 px-3 text-xs">
            <Plus className="size-3" />
            Add Provider
          </Button>
        </Link>
      </div>

      {/* Default Provider Status */}
      {defaultProvider && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-2 rounded-full bg-green-500" />
            <span>Default:</span>
            <span className="font-medium text-foreground">
              {defaultProvider.name}
            </span>
            <span>•</span>
            <span>{defaultProvider.defaultModel}</span>
          </div>
        </div>
      )}

      {/* Scrollable Provider List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {providers.map((provider: LlmProvider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
