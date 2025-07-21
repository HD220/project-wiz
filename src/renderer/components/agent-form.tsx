import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Local type definitions to avoid boundary violations
type AgentStatus = "active" | "inactive" | "busy";

import { useAgentStore } from "@/renderer/store/agent-store";
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
import { Textarea } from "@/components/ui/textarea";

// Model configuration schema
const modelConfigSchema = z.object({
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2, "Temperature must be between 0 and 2"),
  maxTokens: z.number().int().positive("Max tokens must be a positive integer"),
  topP: z.number().min(0).max(1).optional(),
});

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Name too long"),
  role: z.string().min(1, "Agent role is required").max(100, "Role too long"),
  backstory: z
    .string()
    .min(10, "Backstory must be at least 10 characters")
    .max(1000, "Backstory too long"),
  goal: z
    .string()
    .min(10, "Goal must be at least 10 characters")
    .max(500, "Goal too long"),
  providerId: z.string().min(1, "LLM provider is required"),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().positive(),
  topP: z.number().min(0).max(1).optional(),
  status: z.enum(["active", "inactive", "busy"]),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface AgentFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function AgentForm({ userId, onSuccess }: AgentFormProps) {
  const { createAgent, isLoading, error, clearError } = useAgentStore();
  const { providers, loadProviders, getActiveProviders } =
    useLlmProviderStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      backstory: "",
      goal: "",
      providerId: "",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      status: "inactive",
      avatar: "",
    },
  });

  // Load providers on component mount
  useEffect(() => {
    loadProviders(userId);
  }, [userId, loadProviders]);

  const handleSubmit = async (data: FormData) => {
    setSubmitError(null);
    clearError();

    try {
      // Create model configuration
      const modelConfig = {
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        ...(data.topP && { topP: data.topP }),
      };

      // Validate model configuration
      modelConfigSchema.parse(modelConfig);

      const input = {
        name: data.name,
        role: data.role,
        backstory: data.backstory,
        goal: data.goal,
        providerId: data.providerId,
        modelConfig: JSON.stringify(modelConfig),
        status: data.status as AgentStatus,
        ...(data.avatar && { avatar: data.avatar }),
      };

      await createAgent(input);

      // Reset form on success
      form.reset();
      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create agent",
      );
    }
  };

  const activeProviders = getActiveProviders();

  // Model options based on provider type
  const getModelOptions = (providerId: string) => {
    const provider = providers.find((prov) => prov.id === providerId);
    if (!provider) return [];

    switch (provider.type) {
      case "openai":
        return [
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        ];
      case "deepseek":
        return [
          { value: "deepseek-chat", label: "DeepSeek Chat" },
          { value: "deepseek-coder", label: "DeepSeek Coder" },
        ];
      case "anthropic":
        return [
          { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
          { value: "claude-3-haiku", label: "Claude 3 Haiku" },
        ];
      default:
        return [{ value: "default", label: "Default Model" }];
    }
  };

  const selectedProviderId = form.watch("providerId");
  const modelOptions = getModelOptions(selectedProviderId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create AI Agent</h3>
        <p className="text-sm text-muted-foreground">
          Create a new AI agent with a distinct personality and role to help
          with your projects.
        </p>
      </div>

      {activeProviders.length === 0 && (
        <Alert>
          <AlertDescription>
            You need to create at least one active LLM provider before creating
            an agent.
          </AlertDescription>
        </Alert>
      )}

      {(error || submitError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CodeReviewer" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your agent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The agent&apos;s professional role or expertise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="backstory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backstory</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., You are an experienced software engineer with 10 years of experience in building scalable web applications..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the agent&apos;s background and experience.
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
                <FormLabel>Goal</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Help developers write better code by providing detailed code reviews and suggestions for improvement..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What the agent is trying to achieve or help with.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LLM Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} ({provider.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose which LLM provider to use for this agent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The specific model to use for this agent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseFloat(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Controls randomness (0.0-2.0).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="8000"
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Maximum response length.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Whether the agent is ready to work.
                  </FormDescription>
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
                <FormLabel>Avatar URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A URL to an image to represent the agent.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading || activeProviders.length === 0}
            className="w-full"
          >
            {isLoading ? "Creating Agent..." : "Create Agent"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
