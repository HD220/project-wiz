import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, Server, Search, Eye, EyeOff, AlertCircle } from "lucide-react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Switch } from "@/renderer/components/ui/switch";
import { EmptyState } from "@/renderer/features/llm-provider/components/empty-state";
import { ProviderCard } from "@/renderer/features/llm-provider/components/provider-card";

interface ProviderListProps {
  providers: LlmProvider[];
  showInactive?: boolean;
}

export function ProviderList(props: ProviderListProps) {
  const { providers } = props;

  // Get URL search params and navigation following INLINE-FIRST principles
  const search = useSearch({
    from: "/_authenticated/user/settings/llm-providers",
  });
  const navigate = useNavigate();

  // Inline action handlers following INLINE-FIRST principles
  function handleTypeFilter(value: string) {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        type: value === "all" ? undefined : (value as any),
      },
    });
  }

  function handleSearchChange(value: string) {
    // Basic validation: limit search term length
    if (value.length > 100) return;

    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        search: value.trim() || undefined,
      },
    });
  }

  function handleToggleInactive(checked: boolean) {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        showInactive: checked,
      },
    });
  }

  function clearFilters() {
    navigate({
      to: "/user/settings/llm-providers",
      search: {},
    });
  }

  // Inline filter checking and provider categorization following INLINE-FIRST principles
  const hasFilters = !!(search.type || search.search || search.showInactive);
  const filteredProviders = providers; // Backend already handles filtering
  const activeProviders = providers.filter((p) => p.isActive);
  const inactiveProviders = providers.filter((p) => !p.isActive);
  const defaultProvider = providers.find((p) => p.isDefault);

  // Inline statistics calculation for UI display
  const providerStats = {
    total: filteredProviders.length,
    active: activeProviders.length,
    inactive: inactiveProviders.length,
    openai: providers.filter((p) => p.type === "openai").length,
    anthropic: providers.filter((p) => p.type === "anthropic").length,
  };

  // Render empty state when no providers exist and no filters are applied
  if (filteredProviders.length === 0 && !hasFilters) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Professional Agent-style Header */}
      <div className="flex items-center justify-between px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-[var(--spacing-component-md)]">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              LLM Providers
            </h1>
            <p className="text-sm text-muted-foreground">
              {providerStats.total} providers • {providerStats.active} active
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

      {/* Professional Filters */}
      <div className="flex items-center gap-[var(--spacing-component-md)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-sm)] border-b border-border/30 bg-background/50 shrink-0">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={search.search || ""}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-10 h-9 border-border/60 bg-background/50 focus:bg-background"
            maxLength={100}
          />
        </div>

        {/* Type Filter */}
        <Select value={search.type || "all"} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-36 h-9 border-border/60 bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Show Inactive Toggle */}
        <div className="flex items-center gap-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] rounded-md border border-border/60 bg-background/50">
          <Switch
            id="show-inactive-providers"
            checked={!!search.showInactive}
            onCheckedChange={handleToggleInactive}
          />
          <label
            htmlFor="show-inactive-providers"
            className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
          >
            {search.showInactive ? (
              <>
                <Eye className="w-4 h-4" />
                Show Inactive
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Inactive
              </>
            )}
          </label>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Empty Filter Results */}
      {filteredProviders.length === 0 && hasFilters && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No providers match your filters
          </h3>
          <p className="text-base text-muted-foreground mb-6 max-w-md">
            Try adjusting your search criteria or clearing the filters to see
            all providers.
          </p>
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <Search className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
      )}

      {/* Scrollable Provider List with responsive 2-column layout */}
      {filteredProviders.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="p-[var(--spacing-component-sm)] space-y-[var(--spacing-component-xs)]">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--spacing-component-xs)]">
              {filteredProviders.map((provider: LlmProvider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
