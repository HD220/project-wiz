import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Route } from "@/renderer/app/_authenticated/user/settings/llm-providers";
import { Button } from "@/renderer/components/ui/button";
import { EmptyState } from "@/renderer/features/llm-provider/components/empty-state";
import { ProviderCard } from "@/renderer/features/llm-provider/components/provider-card";

function ProviderList() {
  const { providers } = Route.useLoaderData();
  const isLoading = false; // Data is loaded via loader

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-60 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-9 w-28 bg-muted animate-pulse rounded" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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
        <Link to="/user/settings/llm-providers/new">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
        </Link>
      </div>

      {/* Providers List */}
      <div className="space-y-2">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}

export { ProviderList };
