import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Settings, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const logger = getRendererLogger("agent-form");

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { FormLayout, FormSection } from "@/renderer/components/ui/form-layout";
import { Input } from "@/renderer/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Textarea } from "@/renderer/components/ui/textarea";
// import { AI_DEFAULTS } from "@/renderer/constants/ai-defaults"; // TODO: Create ai-defaults constants
import { CreateAgentSchema } from "@/renderer/features/agent/agent.schema";

import { getRendererLogger } from "@/shared/services/logger/renderer";
// Remove imports - using shared types directly
import type { Agent } from "@/shared/types/agent";
import type { LlmProvider } from "@/shared/types/llm-provider";

// Inline types for this component
interface CreateAgentInput {
  name: string;
  role: string;
  backstory: string;
  goal: string;
  providerId: string;
  modelConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  avatar?: string;
}

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}

type FormData = z.infer<typeof CreateAgentSchema>;

interface AgentFormProps {
  initialData?: Agent | null;
  providers?: LlmProvider[];
  onSubmit: (data: CreateAgentInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function AgentForm(props: AgentFormProps) {
  const { initialData, providers = [], onSubmit } = props;

  // Inline default provider selection following INLINE-FIRST principles
  const defaultProvider =
    providers.find((provider) => provider.isDefault) || null;
  const isEditing = !!initialData;

  // Inline default model configuration
  const defaultModelConfig: ModelConfig = {
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.95,
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
      // SIMPLIFIED: Nested modelConfig object
      modelConfig: {
        model: initialData?.modelConfig?.model || defaultModelConfig.model,
        temperature:
          initialData?.modelConfig?.temperature ||
          defaultModelConfig.temperature,
        maxTokens:
          initialData?.modelConfig?.maxTokens || defaultModelConfig.maxTokens,
        topP: initialData?.modelConfig?.topP || defaultModelConfig.topP,
      },
      status: "inactive", // Always default to inactive for safety
      avatar: "", // Avatar is stored in user table, not agent table
    },
  });

  // Inline form submission handler following INLINE-FIRST principles
  function handleSubmit(data: FormData) {
    try {
      // Validate form data again before submission
      const validatedData = CreateAgentSchema.parse(data);
      onSubmit(validatedData);
    } catch (error) {
      // Error handling is done by the parent component via useApiMutation
      // This catch prevents unhandled promise rejection
      logger.error("Error in handleSubmit:", error);
    }
  }

  return (
    <Form {...form}>
      <FormLayout
        id="agent-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        role="form"
        aria-label={isEditing ? "Edit agent form" : "Create agent form"}
        noValidate
      >
        <FormSection className="space-y-6">
          <AgentFormIdentity form={form} />
        </FormSection>

        <FormSection className="space-y-6">
          <AgentFormProvider form={form} providers={providers} />
        </FormSection>
      </FormLayout>
    </Form>
  );
}

// Compound Components for Agent Form

interface AgentFormIdentityProps {
  form: UseFormReturn<FormData>;
}

function AgentFormIdentity(props: AgentFormIdentityProps) {
  const { form } = props;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/0 border border-border/60">
      <CardHeader className="pb-[var(--spacing-component-md)]">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <User className="size-5 text-primary" />
          <div>
            <CardTitle className="text-lg font-semibold">
              Agent Identity
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Define your agent&apos;s basic information and personality
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-[var(--spacing-component-lg)]">
        {/* Basic Info Fields - Spacious Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-component-lg)]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-[var(--spacing-component-lg)]">
                <FormLabel className="text-base font-medium">
                  Agent Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="My AI Assistant"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-[var(--spacing-component-lg)]">
                <FormLabel className="text-base font-medium">Role</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Senior Developer"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Avatar URL - Full Width */}
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-[var(--spacing-component-lg)]">
              <FormLabel className="text-base font-medium">
                Avatar URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-sm text-muted-foreground">
                Optional image URL for your agent&apos;s profile picture
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personality Fields */}
        <div className="space-y-[var(--spacing-layout-md)] pt-4">
          <FormField
            control={form.control}
            name="backstory"
            render={({ field }) => (
              <FormItem className="space-y-[var(--spacing-component-lg)]">
                <FormLabel className="text-base font-medium">
                  Backstory
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="You are an experienced software developer with expertise in modern web technologies, specializing in React, TypeScript, and backend systems. You have years of experience building scalable applications and helping teams write clean, maintainable code."
                    className="min-h-[100px] resize-none leading-relaxed"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground">
                  Describe your agent&apos;s background, expertise, and
                  personality. This helps define how the agent will behave and
                  respond. (10-1000 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem className="space-y-[var(--spacing-component-lg)]">
                <FormLabel className="text-base font-medium">
                  Primary Goal
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Help users write clean, maintainable code and solve complex technical problems. Provide clear explanations, suggest best practices, and guide users through implementation challenges with patience and expertise."
                    className="min-h-[80px] resize-none leading-relaxed"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground">
                  Define your agent&apos;s primary goal and objectives. What
                  should this agent focus on accomplishing? (10-500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentFormProviderProps {
  form: UseFormReturn<FormData>;
  providers: LlmProvider[];
}

function AgentFormProvider(props: AgentFormProviderProps) {
  const { form, providers } = props;

  const activeProviders = providers.filter(
    (provider) => !provider.deactivatedAt,
  );

  return (
    <Card className="bg-gradient-to-br from-chart-3/5 via-chart-3/3 to-chart-3/0 border border-border/60">
      <CardHeader className="pb-[var(--spacing-component-md)]">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <Bot className="size-5 text-chart-3" />
          <div>
            <CardTitle className="text-lg font-semibold">
              AI Provider Configuration
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Configure the AI model and provider settings for your agent
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-[var(--spacing-component-lg)]">
        {/* Provider Selection */}
        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem className="space-y-[var(--spacing-component-lg)]">
              <FormLabel className="text-base font-medium">
                AI Provider
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select an AI provider" />
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
              <FormDescription className="text-sm text-muted-foreground">
                Choose the AI provider that will power this agent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Model Settings Subsection */}
        <div className="space-y-[var(--spacing-layout-md)] pt-4">
          <div className="flex items-center gap-[var(--spacing-component-sm)]">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-muted/20">
              <Settings className="size-3 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground">
              Model Settings
            </h4>
          </div>

          {/* Model Configuration Fields - Spacious Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-component-lg)]">
            <FormField
              control={form.control}
              name="modelConfig.model"
              render={({ field }) => (
                <FormItem className="space-y-[var(--spacing-component-lg)]">
                  <FormLabel className="text-base font-medium">Model</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="gpt-4o" className="h-10" />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    The specific AI model to use (e.g., gpt-4o,
                    claude-3-5-sonnet)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelConfig.temperature"
              render={({ field }) => (
                <FormItem className="space-y-[var(--spacing-component-lg)]">
                  <FormLabel className="text-base font-medium">
                    Temperature
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseFloat(event.target.value))
                      }
                      placeholder="0.7"
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Controls randomness (0.0 = focused, 2.0 = creative)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelConfig.maxTokens"
              render={({ field }) => (
                <FormItem className="space-y-[var(--spacing-component-lg)]">
                  <FormLabel className="text-base font-medium">
                    Max Tokens
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value))
                      }
                      placeholder="4000"
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Maximum number of tokens in the response
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelConfig.topP"
              render={({ field }) => (
                <FormItem className="space-y-[var(--spacing-component-lg)]">
                  <FormLabel className="text-base font-medium">
                    Top P (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value
                            ? parseFloat(event.target.value)
                            : undefined,
                        )
                      }
                      placeholder="0.95"
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Nucleus sampling parameter (0.0-1.0, leave empty for
                    default)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
