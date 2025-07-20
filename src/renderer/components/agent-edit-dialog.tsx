import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Local type definitions
type AgentStatus = "active" | "inactive" | "busy";

interface SelectAgent {
  id: string;
  userId: string;
  providerId: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  status: AgentStatus;
  modelConfig: string;
  createdAt: Date;
  updatedAt: Date;
}

import { useAgentStore } from "@/renderer/store/agent-store";
import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// Model configuration schema
const modelConfigSchema = z.object({
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(32000).default(1000),
  topP: z.number().min(0).max(1).default(1),
});

// Agent update schema
const agentUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.string().min(1, "Role is required").max(100, "Role too long"),
  backstory: z
    .string()
    .min(1, "Backstory is required")
    .max(1000, "Backstory too long"),
  goal: z.string().min(1, "Goal is required").max(500, "Goal too long"),
  providerId: z.string().min(1, "Provider is required"),
  status: z.enum(["active", "inactive", "busy"]),
  modelConfig: modelConfigSchema,
});

type AgentUpdateForm = z.infer<typeof agentUpdateSchema>;

// Configuration templates for common agent types
const agentTemplates = {
  "code-assistant": {
    name: "Code Assistant",
    role: "Senior Software Developer",
    backstory:
      "An experienced developer with expertise in multiple programming languages, software architecture, and best practices. Specializes in writing clean, maintainable code and solving complex technical problems.",
    goal: "Help users write better code, debug issues, and implement software solutions following industry best practices.",
    modelConfig: {
      temperature: 0.3,
      maxTokens: 2000,
      topP: 0.9,
    },
  },
  "creative-writer": {
    name: "Creative Writer",
    role: "Content Creator & Storyteller",
    backstory:
      "A talented writer with a passion for storytelling, creative content creation, and engaging communication. Experienced in various writing styles and formats.",
    goal: "Create compelling, original content and help users develop their writing skills across different formats and styles.",
    modelConfig: {
      temperature: 0.8,
      maxTokens: 1500,
      topP: 0.95,
    },
  },
  "data-analyst": {
    name: "Data Analyst",
    role: "Data Science Specialist",
    backstory:
      "An analytical professional with expertise in data analysis, statistics, and machine learning. Skilled at extracting insights from complex datasets and communicating findings clearly.",
    goal: "Analyze data, identify patterns and trends, and provide actionable insights to support data-driven decision making.",
    modelConfig: {
      temperature: 0.4,
      maxTokens: 1800,
      topP: 0.8,
    },
  },
  "research-assistant": {
    name: "Research Assistant",
    role: "Academic Researcher",
    backstory:
      "A thorough researcher with strong analytical skills and expertise in gathering, evaluating, and synthesizing information from multiple sources.",
    goal: "Conduct comprehensive research, fact-check information, and provide well-sourced, accurate answers to complex questions.",
    modelConfig: {
      temperature: 0.2,
      maxTokens: 2500,
      topP: 0.7,
    },
  },
  "customer-support": {
    name: "Customer Support",
    role: "Customer Success Representative",
    backstory:
      "A friendly and patient support professional with excellent communication skills and deep product knowledge. Focused on providing helpful solutions and positive customer experiences.",
    goal: "Assist customers with their questions and issues, providing clear guidance and ensuring customer satisfaction.",
    modelConfig: {
      temperature: 0.6,
      maxTokens: 1200,
      topP: 0.85,
    },
  },
};

interface AgentEditDialogProps {
  agent: SelectAgent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentEditDialog({
  agent,
  isOpen,
  onClose,
}: AgentEditDialogProps) {
  const { updateAgent } = useAgentStore();
  const { providers, loadProviders } = useLlmProviderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AgentUpdateForm>({
    resolver: zodResolver(agentUpdateSchema),
    defaultValues: {
      name: "",
      role: "",
      backstory: "",
      goal: "",
      providerId: "",
      status: "active",
      modelConfig: {
        model: "",
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
      },
    },
  });

  // Load providers and populate form when agent changes
  useEffect(() => {
    if (agent && isOpen) {
      // Load providers if not already loaded
      if (providers.length === 0) {
        loadProviders(agent.userId);
      }

      // Parse model config
      let modelConfig = {
        model: "",
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
      };

      try {
        const parsed = JSON.parse(agent.modelConfig);
        modelConfig = { ...modelConfig, ...parsed };
      } catch (error) {
        console.warn("Failed to parse model config:", error);
      }

      // Reset form with agent data
      form.reset({
        name: agent.name,
        role: agent.role,
        backstory: agent.backstory,
        goal: agent.goal,
        providerId: agent.providerId,
        status: agent.status,
        modelConfig,
      });
    }
  }, [agent, isOpen, providers.length, loadProviders, form]);

  const onSubmit = async (data: AgentUpdateForm) => {
    if (!agent) return;

    setIsSubmitting(true);
    try {
      await updateAgent(agent.id, {
        ...data,
        modelConfig: JSON.stringify(data.modelConfig),
      });
      onClose();
    } catch (error) {
      console.error("Failed to update agent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProvider = providers.find(
    (p) => p.id === form.watch("providerId"),
  );
  const getModelsForProvider = (providerType: string) => {
    switch (providerType) {
      case "openai":
        return ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"];
      case "deepseek":
        return ["deepseek-chat", "deepseek-coder"];
      case "anthropic":
        return ["claude-3-sonnet", "claude-3-haiku"];
      default:
        return [];
    }
  };

  const activeProviders = providers.filter((p) => p.isActive);

  const applyTemplate = (templateKey: string) => {
    const template = agentTemplates[templateKey as keyof typeof agentTemplates];
    if (template) {
      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        name: template.name,
        role: template.role,
        backstory: template.backstory,
        goal: template.goal,
        modelConfig: {
          ...currentValues.modelConfig,
          ...template.modelConfig,
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>
                Modify your agent&apos;s configuration, model parameters, and
                settings.
              </DialogDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Apply Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(agentTemplates).map(([key, template]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className="flex flex-col items-start"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.role}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Code Assistant" {...field} />
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
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Developer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center">
                              <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center">
                              <div className="mr-2 h-2 w-2 rounded-full bg-gray-500" />
                              Inactive
                            </div>
                          </SelectItem>
                          <SelectItem value="busy">
                            <div className="flex items-center">
                              <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                              Busy
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Background & Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Background & Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="backstory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backstory</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the agent's background, experience, and expertise..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps define the agent&apos;s personality and expertise.
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
                          placeholder="What is this agent's primary objective?"
                          className="min-h-16"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Define the main purpose or objective for this agent.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Model Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  AI Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LLM Provider</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeProviders.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center">
                                <Badge
                                  variant="outline"
                                  className="mr-2 text-xs"
                                >
                                  {provider.type}
                                </Badge>
                                {provider.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProvider && (
                  <FormField
                    control={form.control}
                    name="modelConfig.model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getModelsForProvider(selectedProvider.type).map(
                              (model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Model Parameters</h4>

                  <FormField
                    control={form.control}
                    name="modelConfig.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Temperature</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Controls randomness. Lower values = more focused,
                          higher values = more creative.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelConfig.maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Max Tokens</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={100}
                            max={8000}
                            step={100}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum length of the response.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelConfig.topP"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Top P</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0.1}
                            max={1}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Controls diversity via nucleus sampling.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
