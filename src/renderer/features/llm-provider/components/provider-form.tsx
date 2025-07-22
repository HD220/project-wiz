import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";

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
  const { auth } = useRouteContext({ from: "__root__" });
  const { user } = auth;
  const router = useRouter();

  // SIMPLE: Direct mutations with window.api
  const createProviderMutation = useMutation({
    mutationFn: (data: CreateProviderInput) =>
      window.api.llmProviders.create(data),
    onSuccess: () => {
      toast.success("Provider created successfully");
      router.invalidate(); // Refresh route data
      onClose();
    },
    onError: () => {
      toast.error("Failed to create provider");
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
    onSuccess: () => {
      toast.success("Provider updated successfully");
      router.invalidate(); // Refresh route data
      onClose();
    },
    onError: () => {
      toast.error("Failed to update provider");
    },
  });

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

  function onSubmit(data: ProviderFormData) {
    if (!user?.id) {
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
        userId: user.id,
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
