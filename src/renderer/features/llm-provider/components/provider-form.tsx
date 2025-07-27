import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";
import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

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
import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import {
  PROVIDER_CONFIGS,
  providerFormSchema,
  type ProviderFormData,
} from "../constants";

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
      <DialogContent className="max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Provider" : "Add New Provider"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider Configuration Section */}
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

            {/* API Configuration Section */}
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

              {PROVIDER_CONFIGS[watchedType as keyof typeof PROVIDER_CONFIGS]
                ?.requiresBaseUrl && (
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

            {/* Provider Settings Section */}
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

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
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
