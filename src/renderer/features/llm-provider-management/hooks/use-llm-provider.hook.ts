import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import { llmProviderStore } from "../stores/llm-provider.store";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto
} from "../../../../shared/types/llm-provider.types";

export function useLlmProviders(filter?: LlmProviderFilterDto) {
  const state = useSyncExternalStore(
    llmProviderStore.subscribe,
    llmProviderStore.getSnapshot,
    llmProviderStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const filterRef = useRef(filter);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

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
  }), []);

  const queries = useMemo(() => ({
    loadLlmProviders: (newFilter?: LlmProviderFilterDto, forceReload?: boolean) =>
      llmProviderStore.loadLlmProviders(newFilter || filterRef.current, forceReload),

    getLlmProviderById: (id: string) =>
      llmProviderStore.getLlmProviderById(id),

    refetch: () =>
      llmProviderStore.loadLlmProviders(filterRef.current, true),
  }), [filter]);

  return {
    llmProviders: state.llmProviders,
    isLoading: state.isLoading,
    error: state.error,
    ...mutations,
    ...queries,
  };
}
