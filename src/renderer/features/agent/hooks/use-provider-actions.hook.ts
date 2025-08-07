import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import type { LlmProvider } from "@/shared/types/llm-provider";

export function useProviderActions() {
  const deleteProviderMutation = useApiMutation(
    (id: string) => window.api.llmProvider.inactivate(id),
    {
      successMessage: "Provider deleted successfully",
      errorMessage: "Failed to delete provider",
      invalidateRouter: true,
    },
  );

  const setDefaultProviderMutation = useApiMutation(
    (id: string) => window.api.llmProvider.setDefault({ providerId: id }),
    {
      successMessage: "Default provider updated",
      errorMessage: "Failed to update default provider",
      invalidateRouter: true,
    },
  );

  const handleDelete = (provider: LlmProvider) => {
    deleteProviderMutation.mutate(provider.id);
  };

  const handleSetDefault = (provider: LlmProvider) => {
    setDefaultProviderMutation.mutate(provider.id);
  };

  const isLoading =
    deleteProviderMutation.isPending || setDefaultProviderMutation.isPending;

  return {
    handleDelete,
    handleSetDefault,
    isLoading,
  };
}
