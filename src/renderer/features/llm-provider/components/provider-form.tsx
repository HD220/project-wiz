import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type {
  LlmProvider,
  ProviderType,
} from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Separator } from "@/renderer/components/ui/separator";
import { useAuthStore } from "@/renderer/store/auth.store";
import { useLLMProvidersStore } from "@/renderer/store/llm-provider.store";

import { TestApiButton } from "./test-api-button";

// Simple provider configs for UI
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
  const { createProvider, updateProvider, isLoading } = useLLMProvidersStore();
  const { user } = useAuthStore();

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
      defaultModel: provider?.defaultModel || "gpt-4o",
      isDefault: provider?.isDefault || false,
      isActive: provider?.isActive ?? true,
    },
  });

  const watchedType = form.watch("type");
  const watchedApiKey = form.watch("apiKey");

  // Update default model when provider type changes
  useEffect(() => {
    if (!isEditing) {
      const newDefaultModel = PROVIDER_CONFIGS[watchedType].defaultModel;
      form.setValue("defaultModel", newDefaultModel);

      // Clear base URL if not required for new type
      if (!PROVIDER_CONFIGS[watchedType].requiresBaseUrl) {
        form.setValue("baseUrl", "");
      }
    }
  }, [watchedType, form, isEditing]);

  const onSubmit = async (data: ProviderFormData) => {
    try {
      if (isEditing && provider) {
        await updateProvider(provider.id, data);
        toast.success("Provider updated successfully");
      } else {
        // Include userId when creating new provider
        if (!user?.id) {
          toast.error("User not authenticated");
          return;
        }

        const createData = {
          ...data,
          userId: user.id,
        };

        await createProvider(createData);
        toast.success("Provider created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update provider" : "Failed to create provider",
      );
    }
  };

  const showBaseUrl = PROVIDER_CONFIGS[watchedType].requiresBaseUrl;

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
            {/* Provider Configuration */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Provider Configuration</h4>
                <p className="text-muted-foreground text-xs">
                  Choose your AI provider and give it a name
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="My AI Provider" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* API Configuration */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">API Configuration</h4>
                <p className="text-muted-foreground text-xs">
                  Configure your API credentials and settings
                </p>
              </div>

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="sk-proj-..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showBaseUrl && (
                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.example.com/v1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="defaultModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Model</FormLabel>
                    <FormControl>
                      <Input placeholder="gpt-4o" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Provider Settings */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Provider Settings</h4>
                <p className="text-muted-foreground text-xs">
                  Configure provider behavior and status
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Default Provider
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Use this provider by default for new agents
                        </p>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Active Provider
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Enable this provider for use in agents
                        </p>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <TestApiButton
                data={{
                  type: watchedType,
                  apiKey: watchedApiKey,
                  baseUrl: form.watch("baseUrl"),
                }}
                disabled={!watchedApiKey || isLoading}
                size="default"
              />

              <div className="flex-1" />

              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { ProviderForm };
