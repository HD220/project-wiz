import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";

import { LlmProviderAPI } from "./llm-provider.api";

export function useLLMProviders(userId: string) {
  return useQuery({
    queryKey: ["llm-providers", userId],
    queryFn: () => LlmProviderAPI.list(userId),
    enabled: !!userId,
  });
}

export function useCreateLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProviderInput) => LlmProviderAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}

export function useUpdateLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProviderInput>;
    }) => LlmProviderAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}

export function useDeleteLLMProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LlmProviderAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}

export function useTestLLMProvider() {
  return useMutation({
    mutationFn: (input: CreateProviderInput) =>
      LlmProviderAPI.testConnection(input),
  });
}
