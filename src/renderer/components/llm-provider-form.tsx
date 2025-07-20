import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Local type definition to avoid boundary violations
type ProviderType = "openai" | "deepseek" | "anthropic";

import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["openai", "deepseek", "anthropic"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface LlmProviderFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function LlmProviderForm({ userId, onSuccess }: LlmProviderFormProps) {
  const { createProvider, isLoading, error, clearError } =
    useLlmProviderStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "openai",
      apiKey: "",
      baseUrl: "",
      isDefault: false,
      isActive: true,
    },
  });

  const handleSubmit = async (data: FormData) => {
    setSubmitError(null);
    clearError();

    try {
      const input = {
        userId,
        name: data.name,
        type: data.type as ProviderType,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl || null,
        isDefault: data.isDefault,
        isActive: data.isActive,
      };

      await createProvider(input);

      // Reset form on success
      form.reset();
      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create provider",
      );
    }
  };

  const providerOptions = [
    { value: "openai", label: "OpenAI" },
    { value: "deepseek", label: "DeepSeek" },
    { value: "anthropic", label: "Anthropic" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Add LLM Provider</h3>
        <p className="text-sm text-muted-foreground">
          Add your API credentials to use AI agents with your own LLM provider.
        </p>
      </div>

      {(error || submitError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., My OpenAI Account" {...field} />
                </FormControl>
                <FormDescription>
                  A friendly name to identify this provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the LLM provider you want to connect.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="sk-..." {...field} />
                </FormControl>
                <FormDescription>
                  Your API key will be encrypted and stored securely.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.openai.com/v1" {...field} />
                </FormControl>
                <FormDescription>
                  Custom API endpoint URL. Leave empty to use default.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-6">
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Set as Default</FormLabel>
                    <FormDescription>
                      Use this provider as the default for new agents.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable this provider for use.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Provider"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
