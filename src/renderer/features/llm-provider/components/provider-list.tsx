import { Link } from "@tanstack/react-router";
import { Plus, Settings, Shield } from "lucide-react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { EmptyState } from "@/renderer/features/llm-provider/components/empty-state";
import { ProviderCard } from "@/renderer/features/llm-provider/components/provider-card";
import { cn } from "@/renderer/lib/utils";

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
    <div className="space-y-[var(--spacing-layout-md)]">
      {/* Enhanced Header Section */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/0 border border-border/60 backdrop-blur-sm">
        <CardHeader className="pb-[var(--spacing-component-md)]">
          <div className="flex items-center justify-between">
            <div className="space-y-[var(--spacing-component-xs)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <div className="flex items-center gap-[var(--spacing-component-sm)]">
                  <Settings className="size-5 text-primary" />
                  <CardTitle className="text-xl font-bold">
                    AI Providers
                  </CardTitle>
                </div>
                <div className="flex items-center gap-[var(--spacing-component-sm)]">
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20">
                    {providers.length} Total
                  </div>
                  <div className="px-2 py-1 bg-chart-2/10 text-chart-2 rounded-md text-xs font-medium border border-chart-2/20">
                    {activeProviders} Active
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Manage your AI language model providers and configure settings
                for agent interactions
              </p>
            </div>

            <Link
              to="/user/settings/llm-providers/$providerId/new"
              params={{ providerId: "new" }}
            >
              <Button
                className={cn(
                  "gap-[var(--spacing-component-sm)] shrink-0 shadow-sm",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "hover:from-primary/90 hover:to-primary/80",
                  "transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
                )}
              >
                <Plus className="size-4" />
                Add Provider
              </Button>
            </Link>
          </div>
        </CardHeader>

        {/* Provider Summary */}
        {defaultProvider && (
          <CardContent className="pt-0 border-t border-border/40 bg-card/30">
            <div className="flex items-center gap-[var(--spacing-component-sm)]">
              <Shield className="size-4 text-chart-4" />
              <span className="text-sm text-muted-foreground">
                Default Provider:
              </span>
              <span className="text-sm font-medium text-foreground">
                {defaultProvider.name}
              </span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">
                {defaultProvider.defaultModel}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Enhanced Providers Grid */}
      <div className="space-y-[var(--spacing-component-md)]">
        {providers.map((provider: LlmProvider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
