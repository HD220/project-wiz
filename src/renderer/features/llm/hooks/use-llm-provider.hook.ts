import { useCallback } from "react";

import { useLlmProviderStore } from "../stores/llm-provider.store";

import { useLlmProviderDefault } from "./use-llm-provider-default.hook";
import {
  useCreateLlmProviderMutation,
  useDeleteLlmProviderMutation,
  useSetDefaultLlmProviderMutation,
  useUpdateLlmProviderMutation,
} from "./use-llm-provider-mutations.hook";
import { useLlmProvidersQuery } from "./use-llm-provider-queries.hook";

import type { LlmProviderFilterDto } from "../../../../shared/types/llm/llm-provider.types";

export function useLlmProviders(filter?: LlmProviderFilterDto) {
  const selectedLlmProvider = useLlmProviderStore(
    (state) => state.selectedLlmProvider,
  );
  const setSelectedLlmProvider = useLlmProviderStore(
    (state) => state.setSelectedLlmProvider,
  );

  const providersQuery = useLlmProvidersQuery(filter);
  const { defaultProvider, defaultProviderQuery } =
    useLlmProviderDefault(filter);

  const createLlmProviderMutation = useCreateLlmProviderMutation();
  const updateLlmProviderMutation = useUpdateLlmProviderMutation();
  const deleteLlmProviderMutation = useDeleteLlmProviderMutation();
  const setDefaultLlmProviderMutation = useSetDefaultLlmProviderMutation();

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
    createLlmProvider: createLlmProviderMutation.mutate,
    updateLlmProvider: updateLlmProviderMutation.mutate,
    deleteLlmProvider: deleteLlmProviderMutation.mutate,
    setSelectedLlmProvider,
    setDefaultProvider: setDefaultLlmProviderMutation.mutate,
    refetch,
  };
}
