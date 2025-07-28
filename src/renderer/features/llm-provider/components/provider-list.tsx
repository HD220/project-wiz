import {
  validateSearchInput,
  validateProviderTypeFilter,
} from "@/renderer/lib/search-validation";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, Server, Search, AlertCircle } from "lucide-react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { SearchFilterBar } from "@/renderer/components/ui/search-filter-bar";
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

  // IMPROVED: Type-safe provider type filter with validation
  function handleTypeFilter(value: string) {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        type: validateProviderTypeFilter(value),
      },
    });
  }

  // IMPROVED: Centralized search validation - no more duplication
  function handleSearchChange(value: string) {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        search: validateSearchInput(value),
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
      <SearchFilterBar
        searchValue={search.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search providers..."
        filterValue={search.type || "all"}
        onFilterChange={handleTypeFilter}
        filterOptions={[
          { value: "all", label: "All Types" },
          { value: "openai", label: "OpenAI" },
          { value: "anthropic", label: "Anthropic" },
          { value: "google", label: "Google" },
          { value: "deepseek", label: "DeepSeek" },
          { value: "custom", label: "Custom" },
        ]}
        filterPlaceholder="Type"
        toggleValue={!!search.showInactive}
        onToggleChange={handleToggleInactive}
        toggleLabel="Show Inactive"
        toggleId="show-inactive-providers"
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />

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
