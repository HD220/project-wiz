import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import type { LlmProvider } from "@/renderer/features/agent/provider.types";
// Simple validation functions inline
function validateSearchInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > 100) return trimmed.slice(0, 100);
  return trimmed;
}

function validateProviderTypeFilter(
  value: string,
): "openai" | "deepseek" | "anthropic" | "google" | "custom" | undefined {
  const validTypes = ["openai", "deepseek", "anthropic", "google", "custom"] as const;
  if (value === "all" || !value) return undefined;
  return validTypes.find(type => type === value);
}

export function useProviderList(providers: LlmProvider[]) {
  const search = useSearch({
    from: "/_authenticated/user/settings/llm-providers",
  });
  const navigate = useNavigate();

  const handleTypeFilter = (value: string) => {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        type: validateProviderTypeFilter(value),
      },
    });
  };

  const handleSearchChange = (value: string) => {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        search: validateSearchInput(value),
      },
    });
  };

  const handleToggleInactive = (checked: boolean) => {
    navigate({
      to: "/user/settings/llm-providers",
      search: {
        ...search,
        showInactive: checked,
      },
    });
  };

  const clearFilters = () => {
    navigate({
      to: "/user/settings/llm-providers",
      search: {},
    });
  };

  const hasFilters = useMemo(() => {
    return !!(search.type || search.search || search.showInactive);
  }, [search.type, search.search, search.showInactive]);

  const filteredProviders = providers; // Backend already handles filtering
  const activeProviders = providers.filter(
    (provider) => !provider.deactivatedAt,
  );
  const inactiveProviders = providers.filter(
    (provider) => provider.deactivatedAt,
  );
  const defaultProvider = providers.find((provider) => provider.isDefault);

  const providerStats = useMemo(() => {
    return {
      total: filteredProviders.length,
      active: activeProviders.length,
      inactive: inactiveProviders.length,
      openai: providers.filter((provider) => provider.type === "openai").length,
      anthropic: providers.filter((provider) => provider.type === "anthropic")
        .length,
    };
  }, [filteredProviders, activeProviders, inactiveProviders, providers]);

  return {
    search,
    navigate,
    handleTypeFilter,
    handleSearchChange,
    handleToggleInactive,
    clearFilters,
    hasFilters,
    filteredProviders,
    providerStats,
    defaultProvider,
  };
}
