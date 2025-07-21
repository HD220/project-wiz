import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
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
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Separator } from "@/renderer/components/ui/separator";

import { useLLMProvidersStore } from "@/renderer/store/llm-provider.store";
import { useAuthStore } from "@/renderer/store/auth.store";
import type {
  LlmProvider,
  ProviderType,
} from "@/main/features/agent/llm-provider/llm-provider.types";
import { TestApiButton } from "./test-api-button";
import { toast } from "sonner";

// Simple provider configs for UI
const PROVIDER_CONFIGS = {
  openai: { label: "OpenAI", defaultModel: "gpt-4o", requiresBaseUrl: false },
  deepseek: { label: "DeepSeek", defaultModel: "deepseek-coder", requiresBaseUrl: false },
  anthropic: { label: "Anthropic", defaultModel: "claude-3-5-sonnet-20241022", requiresBaseUrl: false },
  google: { label: "Google", defaultModel: "gemini-pro", requiresBaseUrl: false },
  custom: { label: "Custom", defaultModel: "custom-model", requiresBaseUrl: true },
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
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Provider name is required"),
      type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
      apiKey: z.string().min(1, "API key is required"),
      baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
      defaultModel: z.string().min(1, "Default model is required"),
      isDefault: z.boolean().default(false),
      isActive: z.boolean().default(true),
    })),
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
      toast.error(isEditing ? "Failed to update provider" : "Failed to create provider");
    }
  };

  const showBaseUrl = PROVIDER_CONFIGS[watchedType].requiresBaseUrl;
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "Edit Provider" : "Add New Provider"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Provider Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isEditing} // Don't allow changing type when editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Provider Name */}
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

            {/* API Key */}
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

            {/* Base URL (if required) */}
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

            {/* Default Model */}
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

            <Separator />

            {/* Checkboxes */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default provider</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable this provider</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {/* Test API Button */}
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
              
              {/* Save Button */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Provider"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { ProviderForm };