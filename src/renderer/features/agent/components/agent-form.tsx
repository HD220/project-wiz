import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/renderer/components/ui/button";
import { StatusIndicator } from "@/renderer/components/ui/status-indicator";
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
    <div className="max-w-4xl mx-auto space-y-[var(--spacing-layout-lg)]">
      {/* Enhanced Form Header */}
      <div className="space-y-[var(--spacing-component-md)]">
        {/* Hero Section */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/10">
            <span className="text-2xl font-bold text-primary">
              {isEditing ? "✏️" : "🤖"}
            </span>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 blur opacity-30 animate-pulse"></div>
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? "Edit Agent" : "Create New Agent"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isEditing
              ? "Update your agent's configuration and settings to optimize its performance and behavior."
              : "Configure your new AI agent with identity, behavior, and provider settings to start automating your workflows."}
          </p>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Enhanced Form Container */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl shadow-lg shadow-primary/5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="p-[var(--spacing-layout-lg)] space-y-[var(--spacing-layout-lg)]"
            role="form"
            aria-label={isEditing ? "Edit agent form" : "Create agent form"}
          >
            {/* Agent Identity Section */}
            <section
              aria-labelledby="identity-section"
              className="space-y-[var(--spacing-component-lg)]"
            >
              <AgentFormIdentity form={form} />
            </section>

            {/* Agent Provider Section */}
            <section
              aria-labelledby="provider-section"
              className="space-y-[var(--spacing-component-lg)]"
            >
              <AgentFormProvider form={form} providers={providers} />
            </section>

            {/* Enhanced Form Actions */}
            <div className="pt-[var(--spacing-component-lg)] border-t border-border/40">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-[var(--spacing-component-md)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="sm:w-auto w-full h-11 px-6 border-border/60 hover:bg-accent/50 transition-all duration-200"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || (!isFormValid && hasErrors)}
                  className="sm:w-auto w-full min-w-[160px] h-11 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200"
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
            </div>

            {/* Enhanced Form Status Indicator */}
            {isDirty && (
              <div className="text-center">
                <div className="inline-flex items-center gap-[var(--spacing-component-sm)] px-4 py-2 rounded-lg border border-border/40 bg-card/50">
                  {hasErrors ? (
                    <>
                      <StatusIndicator status="error" size="md" variant="dot" />
                      <span className="text-sm text-destructive font-medium">
                        Please fix the errors above before submitting.
                      </span>
                    </>
                  ) : isFormValid ? (
                    <>
                      <StatusIndicator
                        status="active"
                        size="md"
                        variant="dot"
                        className="animate-pulse"
                      />
                      <span className="text-sm text-chart-2 font-medium">
                        Form is ready to submit.
                      </span>
                    </>
                  ) : (
                    <>
                      <StatusIndicator
                        status="inactive"
                        size="md"
                        variant="dot"
                      />
                      <span className="text-sm text-muted-foreground font-medium">
                        Fill in all required fields to continue.
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
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
      {/* Enhanced Identity Section */}
      <div className="space-y-[var(--spacing-component-lg)]">
        <div className="space-y-[var(--spacing-component-sm)]">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
            <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <span className="text-chart-1 text-sm">👤</span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-foreground">
                Agent Identity
              </h4>
              <p className="text-sm text-muted-foreground">
                Define your agent's name, role, and purpose
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-component-lg)]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-[var(--spacing-component-sm)]">
                <FormLabel className="text-sm font-medium text-foreground">
                  Agent Name *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Assistant"
                    className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-[var(--spacing-component-sm)]">
                <FormLabel className="text-sm font-medium text-foreground">
                  Role *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Senior Developer"
                    className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-[var(--spacing-component-sm)]">
              <FormLabel className="text-sm font-medium text-foreground">
                Avatar URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Optional avatar image URL for your agent
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      <Separator className="bg-border/40" />

      {/* Enhanced Configuration Section */}
      <div className="space-y-[var(--spacing-component-lg)]">
        <div className="space-y-[var(--spacing-component-sm)]">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
            <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <span className="text-chart-3 text-sm">⚙️</span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-foreground">
                Agent Configuration
              </h4>
              <p className="text-sm text-muted-foreground">
                Configure your agent's personality and behavior
              </p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="backstory"
          render={({ field }) => (
            <FormItem className="space-y-[var(--spacing-component-sm)]">
              <FormLabel className="text-sm font-medium text-foreground">
                Backstory *
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="You are an experienced software developer with expertise in modern web technologies..."
                  className="min-h-[120px] border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Describe your agent's background and expertise (10-1000
                characters)
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem className="space-y-[var(--spacing-component-sm)]">
              <FormLabel className="text-sm font-medium text-foreground">
                Goal *
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Help users write clean, maintainable code and solve complex technical problems..."
                  className="min-h-[100px] border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Define your agent's primary goal and objectives (10-500
                characters)
              </FormDescription>
              <FormMessage className="text-xs" />
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
      <Separator className="bg-border/40" />

      {/* Enhanced Provider Section */}
      <div className="space-y-[var(--spacing-component-lg)]">
        <div className="space-y-[var(--spacing-component-sm)]">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
            <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <span className="text-chart-4 text-sm">🤖</span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-foreground">
                AI Provider Configuration
              </h4>
              <p className="text-sm text-muted-foreground">
                Choose the AI provider and configure model settings
              </p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem className="space-y-[var(--spacing-component-sm)]">
              <FormLabel className="text-sm font-medium text-foreground">
                AI Provider *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200">
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
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="space-y-[var(--spacing-component-lg)]">
          <div className="space-y-[var(--spacing-component-sm)]">
            <div className="flex items-center gap-[var(--spacing-component-md)]">
              <div className="w-6 h-6 rounded-md bg-chart-5/10 flex items-center justify-center">
                <span className="text-chart-5 text-xs">⚙️</span>
              </div>
              <div>
                <h5 className="text-lg font-medium text-foreground">
                  Model Settings
                </h5>
                <p className="text-xs text-muted-foreground">
                  Configure the AI model parameters
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-component-lg)]">
            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem className="space-y-[var(--spacing-component-sm)]">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Model
                    </FormLabel>
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
                        className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                  <FormItem className="space-y-[var(--spacing-component-sm)]">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Temperature
                    </FormLabel>
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
                        className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-component-lg)]">
            <FormField
              control={form.control}
              name="modelConfig"
              render={({ field }) => {
                const config = field.value
                  ? JSON.parse(field.value)
                  : defaultModelConfig;
                return (
                  <FormItem className="space-y-[var(--spacing-component-sm)]">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Max Tokens
                    </FormLabel>
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
                        className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                  <FormItem className="space-y-[var(--spacing-component-sm)]">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Top P (Optional)
                    </FormLabel>
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
                        className="h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
