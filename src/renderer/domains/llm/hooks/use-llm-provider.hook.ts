import { useCallback } from "react";

import { useLlmProviderStore } from "../stores/llm-provider.store";

import { useLlmProviderDefault } from "./use-llm-provider-default.hook";
import { useLlmProviderMutations } from "./use-llm-provider-mutations.hook";
import { useLlmProvidersQuery } from "./use-llm-provider-queries.hook";

import type { LlmProviderFilterDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface LlmProviderStoreState {
  selectedLlmProvider: string | null;
  setSelectedLlmProvider: (provider: string | null) => void;
}

export function useLlmProviders(filter?: LlmProviderFilterDto) {
  const selectedLlmProvider = useLlmProviderStore(
    (state: LlmProviderStoreState) => state.selectedLlmProvider,
  );
  const setSelectedLlmProvider = useLlmProviderStore(
    (state: LlmProviderStoreState) => state.setSelectedLlmProvider,
  );

  const providersQuery = useLlmProvidersQuery(filter);
  const { defaultProvider, defaultProviderQuery } =
    useLlmProviderDefault(filter);
  const {
    createLlmProvider,
    updateLlmProvider,
    deleteLlmProvider,
    setDefaultProvider,
  } = useLlmProviderMutations();

  const refetch = useCallback(() => {
    providersQuery.refetch();
    defaultProviderQuery.refetch();
  }, [providersQuery, defaultProviderQuery]);

  return {
    llmProviders: providersQuery.data || [],
    providers: providersQuery.data || [],
    defaultProvider,
    isLoading: providersQuery.isLoading || defaultProviderQuery.isLoading,
    error:
      providersQuery.error?.message ||
      defaultProviderQuery.error?.message ||
      null,
    selectedLlmProvider,
    createLlmProvider,
    updateLlmProvider,
    deleteLlmProvider,
    setSelectedLlmProvider,
    setDefaultProvider,
    refetch,
  };
}
