import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import type { LlmProvider } from "@/renderer/features/agent/provider.types";
import {
  validateSearchInput,
  validateProviderTypeFilter,
} from "@/renderer/lib/search-validation";

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
  const activeProviders = providers.filter((p) => !p.deactivatedAt);
  const inactiveProviders = providers.filter((p) => p.deactivatedAt);
  const defaultProvider = providers.find((p) => p.isDefault);

  const providerStats = useMemo(() => {
    return {
      total: filteredProviders.length,
      active: activeProviders.length,
      inactive: inactiveProviders.length,
      openai: providers.filter((p) => p.type === "openai").length,
      anthropic: providers.filter((p) => p.type === "anthropic").length,
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
