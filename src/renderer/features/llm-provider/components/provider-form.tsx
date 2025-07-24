import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";
import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Form } from "@/renderer/components/ui/form";
import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/lib/api-mutation";

import {
  PROVIDER_CONFIGS,
  providerFormSchema,
  type ProviderFormData,
} from "../constants";

import { ProviderFormActions } from "./provider-form-actions";
import { ProviderConfigSection } from "./provider-form-config-section";
import { ProviderSettingsSection } from "./provider-form-settings-section";

interface ProviderFormProps {
  provider?: LlmProvider | null;
  onClose: () => void;
}

function ProviderForm(props: ProviderFormProps) {
  const { provider, onClose } = props;
  const { user } = useAuth();

  // Standardized mutations with automatic error handling
  const createProviderMutation = useApiMutation(
    (data: CreateProviderInput) => window.api.llmProviders.create(data),
    {
      successMessage: "Provider created successfully",
      errorMessage: "Failed to create provider",
      onSuccess: () => onClose(),
    },
  );

  const updateProviderMutation = useApiMutation(
    ({ id, data }: { id: string; data: Partial<CreateProviderInput> }) =>
      window.api.llmProviders.update(id, data),
    {
      successMessage: "Provider updated successfully",
      errorMessage: "Failed to update provider",
      onSuccess: () => onClose(),
    },
  );

  const isLoading =
    createProviderMutation.isPending || updateProviderMutation.isPending;

  const isEditing = !!provider;

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
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
    if (!user?.id) {
      // This shouldn't happen with session-based auth, but keeping as safety check
      return;
    }

    if (isEditing && provider) {
      updateProviderMutation.mutate({
        id: provider.id,
        data: {
          ...data,
          baseUrl: data.baseUrl || null,
        },
      });
    } else {
      const createData = {
        ...data,
        userId: user.id, // Still needed for provider creation
        baseUrl: data.baseUrl || null,
      };
      createProviderMutation.mutate(createData);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Provider" : "Add New Provider"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ProviderConfigSection
              form={form}
              isEditing={isEditing}
              watchedType={watchedType}
            />
            <ProviderSettingsSection form={form} />
            <ProviderFormActions
              isLoading={isLoading}
              isEditing={isEditing}
              onClose={onClose}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { ProviderForm };
