import { useCallback, useMemo } from "react";
import { useLlmProviderStore } from "../stores/llm-provider.store";
import {
  useLlmProvidersQuery,
  useLlmProviderQuery,
  useDefaultLlmProviderQuery,
  useCreateLlmProviderMutation,
  useUpdateLlmProviderMutation,
  useDeleteLlmProviderMutation,
  useSetDefaultLlmProviderMutation,
} from "./use-llm-provider-queries.hook";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto,
} from "../../../../shared/types/domains/llm/llm-provider.types";

export function useLlmProviders(filter?: LlmProviderFilterDto) {
  const selectedLlmProvider = useLlmProviderStore(
    (state: any) => state.selectedLlmProvider,
  );
  const setSelectedLlmProvider = useLlmProviderStore(
    (state: any) => state.setSelectedLlmProvider,
  );

  const providersQuery = useLlmProvidersQuery(filter);
  const defaultProviderQuery = useDefaultLlmProviderQuery();
  const createMutation = useCreateLlmProviderMutation();
  const updateMutation = useUpdateLlmProviderMutation();
  const deleteMutation = useDeleteLlmProviderMutation();
  const setDefaultMutation = useSetDefaultLlmProviderMutation();

  const defaultProvider = useMemo(() => {
    const providers = providersQuery.data || [];
    return (
      defaultProviderQuery.data ||
      providers.find((p) => p.isDefault) ||
      providers[0] ||
      null
    );
  }, [providersQuery.data, defaultProviderQuery.data]);

  const createLlmProvider = useCallback(
    (data: CreateLlmProviderDto) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateLlmProvider = useCallback(
    (data: UpdateLlmProviderDto) => updateMutation.mutateAsync(data),
    [updateMutation],
  );

  const deleteLlmProvider = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const setDefaultProvider = useCallback(
    (id: string) => setDefaultMutation.mutateAsync(id),
    [setDefaultMutation],
  );

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
