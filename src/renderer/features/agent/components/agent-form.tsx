import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AI_DEFAULTS, MODEL_DEFAULTS } from "@/main/constants/ai-defaults";
import { createAgentSchema } from "@/main/features/agent/agent.types";

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
import type {
  SelectAgent,
  CreateAgentInput,
  ModelConfig,
} from "@/renderer/features/agent/agent.types";

type FormData = z.infer<typeof createAgentSchema>;

interface AgentFormProps {
  initialData?: SelectAgent | null;
  providers?: any[];
  onSubmit: (data: CreateAgentInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function AgentForm(props: AgentFormProps) {
  const { initialData, providers = [], onSubmit, onCancel, isLoading } = props;

  const defaultProvider = providers.find((p: any) => p.isDefault) || null;

  const isEditing = !!initialData;

  // Default model configuration
  const defaultModelConfig: ModelConfig = {
    model: "gpt-4o",
    temperature: AI_DEFAULTS.TEMPERATURE,
    maxTokens: AI_DEFAULTS.MAX_TOKENS,
    topP: AI_DEFAULTS.TOP_P,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || "",
      backstory: initialData?.backstory || "",
      goal: initialData?.goal || "",
      providerId:
        initialData?.providerId || (!isEditing && defaultProvider?.id) || "",
      modelConfig:
        initialData?.modelConfig || JSON.stringify(defaultModelConfig),
      status: "inactive", // Always default to inactive
      avatar: initialData ? "" : "", // Avatar from form
    },
  });

  async function handleSubmit(data: FormData) {
    await onSubmit(data as CreateAgentInput);
  }

  const activeProviders = providers.filter(
    (provider: any) => provider.isActive,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Agent Identity */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Agent Identity</h4>
            <p className="text-muted-foreground text-xs">
              Define your agent's name, role, and purpose
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <FormLabel>Avatar URL (Optional)</FormLabel>
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

        {/* Agent Configuration */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Agent Configuration</h4>
            <p className="text-muted-foreground text-xs">
              Configure your agent's personality and behavior
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
                  Describe your agent's background and expertise (10-1000
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
                  Define your agent's primary goal and objectives (10-500
                  characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Provider & Model Configuration */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">AI Provider Configuration</h4>
            <p className="text-muted-foreground text-xs">
              Choose the AI provider and configure model settings
            </p>
          </div>

          <FormField
            control={form.control}
            name="providerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Provider *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeProviders.map((provider: any) => (
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
              <h4 className="font-medium text-sm">Model Settings</h4>
              <p className="text-muted-foreground text-xs">
                Configure the AI model parameters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                          onChange={(e) => {
                            const newConfig = {
                              ...config,
                              model: e.target.value,
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
                          onChange={(e) => {
                            const newConfig = {
                              ...config,
                              temperature: parseFloat(e.target.value),
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

            <div className="grid grid-cols-2 gap-4">
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
                          onChange={(e) => {
                            const newConfig = {
                              ...config,
                              maxTokens: parseInt(e.target.value),
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
                          onChange={(e) => {
                            const newConfig = {
                              ...config,
                              topP: e.target.value
                                ? parseFloat(e.target.value)
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

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Update Agent"
                : "Create Agent"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { AgentForm };
