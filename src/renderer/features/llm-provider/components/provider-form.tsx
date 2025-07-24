import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Form } from "@/renderer/components/ui/form";

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
  userId: string;
}

function ProviderForm(props: ProviderFormProps) {
  const { provider, onClose, userId } = props;
  const router = useRouter();

  // SIMPLE: Direct mutations with window.api
  const createProviderMutation = useMutation({
    mutationFn: (data: CreateProviderInput) =>
      window.api.llmProviders.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Provider created successfully");
        // Invalidate all routes for simplicity
        router.invalidate();
        onClose();
      } else {
        toast.error(response.error || "Failed to create provider");
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create provider";
      toast.error(errorMessage);
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProviderInput>;
    }) => window.api.llmProviders.update(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Provider updated successfully");
        // Invalidate all routes for simplicity
        router.invalidate();
        onClose();
      } else {
        toast.error(response.error || "Failed to update provider");
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update provider";
      toast.error(errorMessage);
    },
  });

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
    if (!userId) {
      toast.error("User not authenticated");
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
        userId: userId,
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
