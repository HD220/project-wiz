import { useMemo } from "react";

import {
  useDefaultLlmProviderQuery,
  useLlmProvidersQuery,
} from "./use-llm-provider-queries.hook";

import type { LlmProviderFilterDto } from "../../../../shared/types/llm/llm-provider.types";

export function useLlmProviderDefault(filter?: LlmProviderFilterDto) {
  const providersQuery = useLlmProvidersQuery(filter);
  const defaultProviderQuery = useDefaultLlmProviderQuery();

  const defaultProvider = useMemo(() => {
    const providers = providersQuery.data || [];
    return (
      defaultProviderQuery.data ||
      providers.find((provider) => provider.isDefault) ||
      providers[0] ||
      null
    );
  }, [providersQuery.data, defaultProviderQuery.data]);

  return {
    defaultProvider,
    defaultProviderQuery,
  };
}
