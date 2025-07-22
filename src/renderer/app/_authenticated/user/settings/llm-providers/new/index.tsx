import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { TestApiButton } from "@/renderer/features/llm-provider/components/test-api-button";
import { useCreateLLMProvider } from "@/renderer/features/llm-provider/hooks/use-llm-providers";

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

const formSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  defaultModel: z.string().min(1, "Default model is required"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

function NewProviderModal() {
  const navigate = useNavigate();
  const createProviderMutation = useCreateLLMProvider();
  const { auth } = useRouteContext({ from: "__root__" });
  const { user } = auth;

  const isLoading = createProviderMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "openai",
      apiKey: "",
      baseUrl: "",
      defaultModel: "gpt-4o",
      isDefault: false,
      isActive: true,
    },
  });

  const watchedType = form.watch("type");
  const watchedApiKey = form.watch("apiKey");

  // Update default model when provider type changes
  useEffect(() => {
    const newDefaultModel = PROVIDER_CONFIGS[watchedType].defaultModel;
    form.setValue("defaultModel", newDefaultModel);

    // Clear base URL if not required for new type
    if (!PROVIDER_CONFIGS[watchedType].requiresBaseUrl) {
      form.setValue("baseUrl", "");
    }
  }, [watchedType, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }

      const createData = {
        ...data,
        userId: user.id,
        baseUrl: data.baseUrl || null,
      };

      await createProviderMutation.mutateAsync(createData);
      toast.success("Provider created successfully");
      navigate({ to: "/user/settings/llm-providers" });
    } catch (error) {
      console.error("Error creating provider:", error);
      toast.error(
        "Failed to create provider. Please check your details and try again.",
      );
    }
  };

  const handleClose = () => {
    navigate({ to: "/user/settings/llm-providers" });
  };

  const showBaseUrl = PROVIDER_CONFIGS[watchedType].requiresBaseUrl;

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New AI Provider</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PROVIDER_CONFIGS).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ),
                        )}
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
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My OpenAI Provider" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* API Configuration */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
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
                      <FormLabel>Base URL</FormLabel>
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

            {/* Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default provider</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        This provider will be used by default for new agents
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable this provider</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Disabled providers cannot be used by agents
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
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

              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Provider"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/new/",
)({
  component: NewProviderModal,
});
