import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateProviderInput,
  LlmProvider,
  ProviderType,
} from "@/main/features/agent/llm-provider/llm-provider.types";

interface UpdateProviderInput {
  name?: string;
  type?: ProviderType;
  apiKey?: string;
  baseUrl?: string | null;
  defaultModel?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

interface TestApiKeyInput {
  type: ProviderType;
  apiKey: string;
  baseUrl?: string;
}

export function useLLMProviders(userId: string) {
  return useQuery({
    queryKey: ["llmProviders", userId],
    queryFn: async () => {
      const response = await window.api.llmProviders.list(userId);
      if (!response.success) {
        throw new Error(response.error || "Failed to load providers");
      }
      return response.data as LlmProvider[];
    },
    enabled: !!userId,
  });
}

export function useCreateLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProviderInput) => {
      const response = await window.api.llmProviders.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create provider");
      }
      return response.data as LlmProvider;
    },
    onSuccess: (_, variables) => {
      // Invalidate providers list for this user
      queryClient.invalidateQueries({
        queryKey: ["llmProviders", variables.userId],
      });
    },
  });
}

export function useUpdateLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProviderInput;
      userId: string;
    }) => {
      const response = await window.api.llmProviders.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update provider");
      }
      return response.data as LlmProvider;
    },
    onSuccess: (_, variables) => {
      // Invalidate providers list for this user
      queryClient.invalidateQueries({
        queryKey: ["llmProviders", variables.userId],
      });
    },
  });
}

export function useDeleteLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const response = await window.api.llmProviders.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete provider");
      }
      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate providers list for this user
      queryClient.invalidateQueries({
        queryKey: ["llmProviders", variables.userId],
      });
    },
  });
}

export function useSetDefaultLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const response = await window.api.llmProviders.setDefault(id, userId);
      if (!response.success) {
        throw new Error(response.error || "Failed to set default provider");
      }
      return response.data as LlmProvider;
    },
    onSuccess: (_, variables) => {
      // Invalidate providers list for this user
      queryClient.invalidateQueries({
        queryKey: ["llmProviders", variables.userId],
      });
    },
  });
}

export function useTestLLMProvider() {
  return useMutation({
    mutationFn: async (data: TestApiKeyInput) => {
      const response = await window.api.llmProviders.testApiKey(
        data.type,
        data.apiKey,
        data.baseUrl,
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to test provider");
      }
      return response.data as boolean;
    },
  });
}

export function useDefaultLLMProvider(userId: string) {
  const { data: providers } = useLLMProviders(userId);
  return providers?.find((provider) => provider.isDefault) || null;
}
