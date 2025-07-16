import { useMutation, useQueryClient } from "@tanstack/react-query";
import { llmProviderService } from "../services/llm-provider.service";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
} from "../../../../shared/types/domains/llm/llm-provider.types";

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