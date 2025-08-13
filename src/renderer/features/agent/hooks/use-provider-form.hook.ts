import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import {
  PROVIDER_CONFIGS,
  type ProviderFormData,
  providerFormSchema,
} from "@/renderer/features/agent/provider-constants";
import type { LlmProvider } from "@/renderer/features/agent/provider.types";

import { getRendererLogger } from "@/shared/services/logger/renderer";

const logger = getRendererLogger("use-provider-form");

interface UseProviderFormProps {
  provider?: LlmProvider | null;
}

export function useProviderForm({ provider }: UseProviderFormProps) {
  const router = useRouter();

  const isEditing = !!provider;

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: provider?.name || "",
      type: provider?.type || "openai",
      apiKey: provider?.apiKey || "",
      baseUrl: provider?.baseUrl || "",
      defaultModel:
        provider?.defaultModel ||
        PROVIDER_CONFIGS[provider?.type || "openai"].defaultModel,
      isDefault: provider?.isDefault || false,
      isActive: provider ? !provider.deactivatedAt : true,
    },
  });

  const watchedType = form.watch("type");

  function onSubmit(data: ProviderFormData) {
    // TODO: Implement proper form submission with API calls
    logger.info("Form submission:", data);
    // For now, just navigate back
    router.navigate({ to: "/user/settings/llm-providers" });
  }

  return {
    form,
    isLoading: false, // router doesn't have state.isLoading in this version
    isEditing,
    watchedType,
    onSubmit,
  };
}
