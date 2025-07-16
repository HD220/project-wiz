import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { llmProviderService } from "../services/llm-provider.service";
import type {
  LlmProviderDto,
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto,
} from "../../../../shared/types/domains/llm/llm-provider.types";

export function useLlmProvidersQuery(filter?: LlmProviderFilterDto) {
  return useQuery({
    queryKey: ["llmProviders", filter],
    queryFn: () => llmProviderService.list(filter),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLlmProviderQuery(id: string) {
  return useQuery({
    queryKey: ["llmProvider", id],
    queryFn: () => llmProviderService.getById(id),
    enabled: !!id,
  });
}

export function useDefaultLlmProviderQuery() {
  return useQuery({
    queryKey: ["llmProvider", "default"],
    queryFn: () => llmProviderService.getDefault(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateLlmProviderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLlmProviderDto) => llmProviderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llmProviders"] });
    },
  });
}

export function useUpdateLlmProviderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLlmProviderDto) => llmProviderService.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["llmProviders"] });
      queryClient.invalidateQueries({
        queryKey: ["llmProvider", variables.id],
      });
    },
  });
}

export function useDeleteLlmProviderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => llmProviderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llmProviders"] });
    },
  });
}

export function useSetDefaultLlmProviderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => llmProviderService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llmProviders"] });
      queryClient.invalidateQueries({ queryKey: ["llmProvider", "default"] });
    },
  });
}
