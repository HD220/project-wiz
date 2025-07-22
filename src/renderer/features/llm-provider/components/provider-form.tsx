import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteContext } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type {
  LlmProvider,
  ProviderType,
} from "@/main/features/agent/llm-provider/llm-provider.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Form } from "@/renderer/components/ui/form";
import {
  useCreateLLMProvider,
  useUpdateLLMProvider,
} from "@/renderer/features/llm-provider/hooks/use-llm-providers";

import { ProviderFormActions } from "./provider-form-actions";
import { ProviderConfigSection } from "./provider-form-config-section";
import { ProviderSettingsSection } from "./provider-form-settings-section";

const PROVIDER_CONFIGS = {
  openai: { label: "OpenAI", defaultModel: "gpt-4o", requiresBaseUrl: false },
  deepseek: {
    label: "DeepSeek",
    defaultModel: "deepseek-coder",
    requiresBaseUrl: false,
  },
  anthropic: {
    label: "Anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    requiresBaseUrl: false,
  },
  google: {
    label: "Google",
    defaultModel: "gemini-pro",
    requiresBaseUrl: false,
  },
  custom: {
    label: "Custom",
    defaultModel: "custom-model",
    requiresBaseUrl: true,
  },
} as const;

type ProviderFormData = {
  name: string;
  type: ProviderType;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  isDefault: boolean;
  isActive: boolean;
};

interface ProviderFormProps {
  provider?: LlmProvider | null;
  onClose: () => void;
}

function ProviderForm(props: ProviderFormProps) {
  const { provider, onClose } = props;
  const createProviderMutation = useCreateLLMProvider();
  const updateProviderMutation = useUpdateLLMProvider();
  const { auth } = useRouteContext({ from: "__root__" });
  const { user } = auth;

  const isLoading =
    createProviderMutation.isPending || updateProviderMutation.isPending;

  const isEditing = !!provider;

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Provider name is required"),
        type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
        apiKey: z.string().min(1, "API key is required"),
        baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
        defaultModel: z.string().min(1, "Default model is required"),
        isDefault: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }),
    ),
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
  const watchedApiKey = form.watch("apiKey");

  const onSubmit = async (data: ProviderFormData) => {
    try {
      if (isEditing && provider) {
        if (!user?.id) {
          toast.error("User not authenticated");
          return;
        }
        await updateProviderMutation.mutateAsync({
          id: provider.id,
          data,
          userId: user.id,
        });
        toast.success("Provider updated successfully");
      } else {
        if (!user?.id) {
          toast.error("User not authenticated");
          return;
        }

        const createData = {
          ...data,
          userId: user.id,
        };

        await createProviderMutation.mutateAsync(createData);
        toast.success("Provider created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update provider" : "Failed to create provider",
      );
    }
  };

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
              watchedType={watchedType}
              watchedApiKey={watchedApiKey}
              baseUrl={form.watch("baseUrl")}
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
