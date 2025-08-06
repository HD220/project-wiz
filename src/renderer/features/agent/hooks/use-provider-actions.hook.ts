import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import type { LlmProvider } from "@/renderer/features/agent/provider.types";

export function useProviderActions() {
  const deleteProviderMutation = useApiMutation(
    (id: string) => window.api.llmProviders.delete(id),
    {
      successMessage: "Provider deleted successfully",
      errorMessage: "Failed to delete provider",
      invalidateRouter: true,
    },
  );

  const setDefaultProviderMutation = useApiMutation(
    (id: string) => window.api.llmProviders.setDefault({ providerId: id }),
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
