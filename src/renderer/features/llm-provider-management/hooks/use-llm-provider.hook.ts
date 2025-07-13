import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import { llmProviderStore } from "../stores/llm-provider.store";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto
} from "../../../../shared/types/llm-provider.types";
import { LlmProviderDto } from "../../../../shared/types/llm-provider.types";

export function useLlmProviders(filter?: LlmProviderFilterDto) {
  const state = useSyncExternalStore(
    llmProviderStore.subscribe,
    llmProviderStore.getSnapshot,
    llmProviderStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    const loadInitialLlmProviders = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await llmProviderStore.loadLlmProviders(filterRef.current);
      }
    };

    loadInitialLlmProviders();
  }, []);

  const mutations = useMemo(() => ({
    createLlmProvider: (data: CreateLlmProviderDto) =>
      llmProviderStore.createLlmProvider(data),

    updateLlmProvider: (data: UpdateLlmProviderDto) =>
      llmProviderStore.updateLlmProvider(data),

    deleteLlmProvider: (id: string) =>
      llmProviderStore.deleteLlmProvider(id),

    setSelectedLlmProvider: (llmProvider: LlmProviderDto | null) =>
      llmProviderStore.setSelectedLlmProvider(llmProvider),

    clearError: () => llmProviderStore.clearError(),
  }), []);

  const queries = useMemo(() => ({
    loadLlmProviders: (newFilter?: LlmProviderFilterDto, forceReload?: boolean) =>
      llmProviderStore.loadLlmProviders(newFilter || filterRef.current, forceReload),

    getLlmProviderById: (id: string) =>
      llmProviderStore.getLlmProviderById(id),

    getDefaultProvider: () =>
      llmProviderStore.getDefaultProvider(),

    setDefaultProvider: (id: string) =>
      llmProviderStore.setDefaultProvider(id),

    refetch: () =>
      llmProviderStore.loadLlmProviders(filterRef.current, true),
  }), []);

  return {
    llmProviders: state.llmProviders,
    isLoading: state.isLoading,
    error: state.error,
    selectedLlmProvider: state.selectedLlmProvider,
    ...mutations,
    ...queries,
  };
}
