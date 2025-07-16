import { useQuery } from "@tanstack/react-query";
import { llmProviderService } from "../services/llm-provider.service";
import type { LlmProviderFilterDto } from "../../../../shared/types/domains/llm/llm-provider.types";

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