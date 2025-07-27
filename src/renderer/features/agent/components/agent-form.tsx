import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/renderer/components/ui/button";
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
import { Separator } from "@/renderer/components/ui/separator";
import { Textarea } from "@/renderer/components/ui/textarea";
import { AI_DEFAULTS } from "@/renderer/constants/ai-defaults";
import { CreateAgentSchema } from "@/renderer/features/agent/agent.schema";
import type {
  SelectAgent,
  CreateAgentInput,
  ModelConfig,
} from "@/renderer/features/agent/agent.types";
import type { LlmProvider } from "@/renderer/features/agent/llm-provider.types";

type FormData = z.infer<typeof CreateAgentSchema>;

interface AgentFormProps {
  initialData?: SelectAgent | null;
  providers?: LlmProvider[];
  onSubmit: (data: CreateAgentInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AgentForm(props: AgentFormProps) {
  const { initialData, providers = [], onSubmit, onCancel, isLoading } = props;

  // Inline default provider selection following INLINE-FIRST principles
  const defaultProvider =
    providers.find((provider) => provider.isDefault) || null;
  const isEditing = !!initialData;

  // Inline default model configuration
  const defaultModelConfig: ModelConfig = {
    model: "gpt-4o",
    temperature: AI_DEFAULTS.TEMPERATURE,
    maxTokens: AI_DEFAULTS.MAX_TOKENS,
    topP: AI_DEFAULTS.TOP_P,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(CreateAgentSchema),
    mode: "onChange", // Provide immediate validation feedback
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || "",
      backstory: initialData?.backstory || "",
      goal: initialData?.goal || "",
      providerId:
        initialData?.providerId || (!isEditing && defaultProvider?.id) || "",
      modelConfig:
        initialData?.modelConfig || JSON.stringify(defaultModelConfig),
      status: "inactive", // Always default to inactive for safety
      avatar: "", // Avatar is stored in user table, not agent table
    },
  });

  // Inline form submission handler following INLINE-FIRST principles
  async function handleSubmit(data: FormData) {
    try {
      // Validate form data again before submission
      const validatedData = CreateAgentSchema.parse(data);
      await onSubmit(validatedData as CreateAgentInput);
    } catch (error) {
      // Error handling is done by the parent component via useApiMutation
      // This catch prevents unhandled promise rejection
      console.error("Error in handleSubmit:", error);
    }
  }

  // Inline cancel handler with form reset
  function handleCancel() {
    form.reset();
    onCancel();
  }

  // Inline validation state checks
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isFormValid = form.formState.isValid;
  const isDirty = form.formState.isDirty;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Form Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit Agent" : "Create New Agent"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Update your agent's configuration and settings."
            : "Configure your new AI agent with identity, behavior, and provider settings."}
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
          role="form"
          aria-label={isEditing ? "Edit agent form" : "Create agent form"}
        >
          {/* Agent Identity Section */}
          <section aria-labelledby="identity-section">
            <AgentFormIdentity form={form} />
          </section>

          {/* Agent Provider Section */}
          <section aria-labelledby="provider-section">
            <AgentFormProvider form={form} providers={providers} />
          </section>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading || (!isFormValid && hasErrors)}
              className="sm:w-auto w-full min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Agent"
              ) : (
                "Create Agent"
              )}
            </Button>
          </div>

          {/* Form Status Indicator */}
          {isDirty && (
            <div className="text-xs text-muted-foreground text-center">
              {hasErrors ? (
                <span className="text-destructive">
                  Please fix the errors above before submitting.
                </span>
              ) : isFormValid ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Form is ready to submit.
                </span>
              ) : (
                <span>Fill in all required fields to continue.</span>
              )}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

// Compound Components for Agent Form

interface AgentFormIdentityProps {
  form: UseFormReturn<FormData>;
}

function AgentFormIdentity(props: AgentFormIdentityProps) {
  const { form } = props;

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-medium">Agent Identity</h4>
          <p className="text-sm text-muted-foreground">
            Define your agent&apos;s name, role, and purpose
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name *</FormLabel>
                <FormControl>
                  <Input placeholder="My Assistant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional avatar image URL for your agent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-medium">Agent Configuration</h4>
          <p className="text-sm text-muted-foreground">
            Configure your agent&apos;s personality and behavior
          </p>
        </div>

        <FormField
          control={form.control}
          name="backstory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backstory *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="You are an experienced software developer with expertise in modern web technologies..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe your agent&apos;s background and expertise (10-1000
                characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Help users write clean, maintainable code and solve complex technical problems..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Define your agent&apos;s primary goal and objectives (10-500
                characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

interface AgentFormProviderProps {
  form: UseFormReturn<FormData>;
  providers: LlmProvider[];
}

function AgentFormProvider(props: AgentFormProviderProps) {
  const { form, providers } = props;

  const activeProviders = providers.filter((provider) => provider.isActive);

  const defaultModelConfig: ModelConfig = {
    model: "gpt-4o",
    temperature: AI_DEFAULTS.TEMPERATURE,
    maxTokens: AI_DEFAULTS.MAX_TOKENS,
    topP: AI_DEFAULTS.TOP_P,
  };

  return (
    <>
      <Separator />

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-medium">AI Provider Configuration</h4>
          <p className="text-sm text-muted-foreground">
            Choose the AI provider and configure model settings
          </p>
        </div>

        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                      {provider.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-lg font-medium">Model Settings</h4>
            <p className="text-sm text-muted-foreground">
              Configure the AI model parameters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input
                        value={config.model}
                        onChange={(event) => {
                          const newConfig = {
                            ...config,
                            model: event.target.value,
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="gpt-4o"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(event) => {
                          const newConfig = {
                            ...config,
                            temperature: parseFloat(event.target.value),
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="0.7"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        value={config.maxTokens}
                        onChange={(event) => {
                          const newConfig = {
                            ...config,
                            maxTokens: parseInt(event.target.value),
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="4000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem>
                    <FormLabel>Top P (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.topP || ""}
                        onChange={(event) => {
                          const newConfig = {
                            ...config,
                            topP: event.target.value
                              ? parseFloat(event.target.value)
                              : undefined,
                          };
                          field.onChange(JSON.stringify(newConfig));
                        }}
                        placeholder="0.9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
