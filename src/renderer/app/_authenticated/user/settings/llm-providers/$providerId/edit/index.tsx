import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useRouteContext } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";

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

function EditProviderModal() {
  const navigate = useNavigate();
  const { providerId } = Route.useParams();
  const { auth } = useRouteContext({ from: "__root__" });
  const router = useRouter();

  // SIMPLE: Get provider from route loader
  const { provider } = Route.useLoaderData();

  // SIMPLE: Direct mutation with window.api
  const updateProviderMutation = useMutation({
    mutationFn: (data: Partial<CreateProviderInput>) =>
      window.api.llmProviders.update(providerId, data),
    onSuccess: () => {
      toast.success("Provider updated successfully");
      router.invalidate(); // Refresh route data
      navigate({ to: "/user/settings/llm-providers" });
    },
    onError: () => {
      toast.error(
        "Failed to update provider. Please check your details and try again.",
      );
    },
  });

  const isLoading = updateProviderMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: provider?.name || "",
      type: provider?.type || "openai",
      apiKey: provider?.apiKey || "",
      baseUrl: provider?.baseUrl || "",
      defaultModel: provider?.defaultModel || "gpt-4o",
      isDefault: provider?.isDefault || false,
      isActive: provider?.isActive ?? true,
    },
  });

  const watchedType = form.watch("type");
  const watchedApiKey = form.watch("apiKey");

  function onSubmit(data: FormData) {
    if (!provider || !auth.user?.id) return;

    const updateData = {
      ...data,
      baseUrl: data.baseUrl || null,
    };

    updateProviderMutation.mutate(updateData);
  }

  function handleClose() {
    navigate({ to: "/user/settings/llm-providers" });
  }

  if (!provider) {
    return null;
  }

  const showBaseUrl = PROVIDER_CONFIGS[watchedType].requiresBaseUrl;

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
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
                      disabled
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
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
                    <p className="text-xs text-muted-foreground">
                      Provider type cannot be changed
                    </p>
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
                {isLoading ? "Updating..." : "Update Provider"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId/edit/",
)({
  loader: async ({ context, params }) => {
    const auth = context.auth;
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    const response = await window.api.llmProviders.list(auth.user.id);
    if (!response.success) {
      throw new Error(response.error || "Failed to load providers");
    }
    const provider = response.data?.find((p) => p.id === params.providerId);

    if (!provider) {
      throw new Error("Provider not found");
    }

    return { provider };
  },
  component: EditProviderModal,
});
