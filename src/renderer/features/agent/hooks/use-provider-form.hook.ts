import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { PROVIDER_CONFIGS, ProviderFormData, providerFormSchema } from "@/renderer/features/agent/provider-constants";
import { LlmProvider } from "@/renderer/features/agent/provider.types";
import { useRouter } from "@tanstack/react-router";

interface UseProviderFormProps {
  provider?: LlmProvider | null;
}

export function useProviderForm({ provider }: UseProviderFormProps) {
  const router = useRouter();

  const isEditing = !!provider;

  const form = useForm<ProviderFormData>({
    defaultValues: {
      name: provider?.name || "",
      type: provider?.type || "openai",
      apiKey: provider?.apiKey || "",
      baseUrl: provider?.baseUrl || undefined,
      defaultModel:
        provider?.defaultModel ||
        PROVIDER_CONFIGS[provider?.type || "openai"].defaultModel,
      isDefault: provider?.isDefault || false,
      isActive: provider?.isActive ?? true,
    },
  });

  const watchedType = form.watch("type");

  function onSubmit(data: ProviderFormData) {
    router.submit(form, {
      action: isEditing
        ? `/user/settings/llm-providers/${provider?.id}/edit`
        : "/user/settings/llm-providers/new",
      method: "post",
    });
  }

  return {
    form,
    isLoading: router.state.isLoading,
    isEditing,
    watchedType,
    onSubmit,
  };
}
