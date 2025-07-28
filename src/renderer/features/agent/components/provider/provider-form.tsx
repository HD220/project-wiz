import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Settings,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useForm } from "react-hook-form";

import type {
  CreateProviderInput,
  LlmProvider,
} from "@/renderer/features/agent/provider.types";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
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
  FormDescription,
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
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

import {
  PROVIDER_CONFIGS,
  providerFormSchema,
  type ProviderFormData,
} from "@/renderer/features/agent/provider-constants";

interface ProviderFormProps {
  provider?: LlmProvider | null;
  onClose: () => void;
}

export function ProviderForm(props: ProviderFormProps) {
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
      <DialogContent
        className="max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] bg-card/95 backdrop-blur-sm border border-border/60"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-[var(--spacing-component-sm)] pb-[var(--spacing-component-lg)] border-b border-border/40">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {isEditing ? "Edit Provider" : "Add New Provider"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isEditing
              ? "Update your AI provider configuration and settings"
              : "Configure a new AI provider to enable agent interactions"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-[var(--spacing-component-md)]"
          >
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-[var(--spacing-layout-md)] pr-4">
                {/* Provider Configuration Section */}
                <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/0 border border-border/60">
                  <CardHeader className="pb-[var(--spacing-component-md)]">
                    <div className="flex items-center gap-[var(--spacing-component-sm)]">
                      <Settings className="size-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          Provider Configuration
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          Choose your AI provider and give it a name
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-[var(--spacing-component-lg)]">
                    <div className="grid grid-cols-2 gap-[var(--spacing-component-lg)]">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                              Provider Type
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isEditing}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors">
                                  <SelectValue placeholder="Select provider type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-card/95 backdrop-blur-sm border border-border/60">
                                {Object.entries(PROVIDER_CONFIGS).map(
                                  ([key, config]) => (
                                    <SelectItem
                                      key={key}
                                      value={key}
                                      className="focus:bg-accent/50"
                                    >
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
                            <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                              Display Name
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="My AI Provider"
                                className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* API Configuration Section */}
                <Card className="bg-gradient-to-br from-chart-3/5 via-chart-3/3 to-chart-3/0 border border-border/60">
                  <CardHeader className="pb-[var(--spacing-component-md)]">
                    <div className="flex items-center gap-[var(--spacing-component-sm)]">
                      <Key className="size-5 text-chart-3" />
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          API Configuration
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          Configure your API credentials and endpoint settings
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-[var(--spacing-component-lg)]">
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                            API Key
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="sk-proj-..."
                              className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Your API key will be stored securely and used for
                            authentication
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {PROVIDER_CONFIGS[
                      watchedType as keyof typeof PROVIDER_CONFIGS
                    ]?.requiresBaseUrl && (
                      <FormField
                        control={form.control}
                        name="baseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                              Base URL
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://api.example.com/v1"
                                className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                              Custom API endpoint for your provider
                            </FormDescription>
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
                          <FormLabel className="text-sm font-semibold">
                            Default Model
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="gpt-4o"
                              className="bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            The default model to use for new agents with this
                            provider
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Provider Settings Section */}
                <Card className="bg-gradient-to-br from-chart-4/5 via-chart-4/3 to-chart-4/0 border border-border/60">
                  <CardHeader className="pb-[var(--spacing-component-md)]">
                    <div className="flex items-center gap-[var(--spacing-component-sm)]">
                      <Shield className="size-5 text-chart-4" />
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          Provider Settings
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          Configure provider behavior and default status
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-[var(--spacing-component-lg)]">
                    <div className="grid gap-[var(--spacing-component-lg)]">
                      <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem
                            className={cn(
                              "flex flex-row items-center justify-between rounded-lg border p-[var(--spacing-component-md)] transition-colors",
                              "bg-background/30 border-border/60 hover:bg-background/50",
                              field.value && "bg-primary/5 border-primary/20",
                            )}
                          >
                            <div className="space-y-[var(--spacing-component-xs)]">
                              <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                                <CheckCircle2 className="size-4 text-chart-4" />
                                Default Provider
                              </FormLabel>
                              <FormDescription className="text-xs text-muted-foreground">
                                Use this provider by default for new agents
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem
                            className={cn(
                              "flex flex-row items-center justify-between rounded-lg border p-[var(--spacing-component-md)] transition-colors",
                              "bg-background/30 border-border/60 hover:bg-background/50",
                              field.value && "bg-chart-2/5 border-chart-2/20",
                            )}
                          >
                            <div className="space-y-[var(--spacing-component-xs)]">
                              <FormLabel className="text-sm font-semibold flex items-center gap-[var(--spacing-component-sm)]">
                                <AlertCircle className="size-4 text-chart-2" />
                                Active Provider
                              </FormLabel>
                              <FormDescription className="text-xs text-muted-foreground">
                                Enable this provider for use in agents
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-chart-2 data-[state=checked]:border-chart-2"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Enhanced Form Actions */}
            <div className="flex items-center gap-[var(--spacing-component-md)] pt-[var(--spacing-component-lg)] border-t border-border/40">
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="hover:bg-accent/50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "gap-[var(--spacing-component-sm)] shadow-sm",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "hover:from-primary/90 hover:to-primary/80",
                  "transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Update Provider
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Create Provider
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
