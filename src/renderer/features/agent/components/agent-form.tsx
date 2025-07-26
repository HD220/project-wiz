import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/renderer/components/ui/button";
import { Form } from "@/renderer/components/ui/form";
import { AI_DEFAULTS } from "@/renderer/constants/ai-defaults";
import { CreateAgentSchema } from "@/renderer/features/agent/agent.schema";
import type {
  SelectAgent,
  CreateAgentInput,
  ModelConfig,
} from "@/renderer/features/agent/agent.types";
import type { LlmProvider } from "@/renderer/features/agent/llm-provider.types";

import { AgentIdentitySection } from "./agent-form-identity-section";
import { AgentProviderSection } from "./agent-form-provider-section";

type FormData = z.infer<typeof CreateAgentSchema>;

interface AgentFormProps {
  initialData?: SelectAgent | null;
  providers?: LlmProvider[];
  onSubmit: (data: CreateAgentInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function AgentForm(props: AgentFormProps) {
  const { initialData, providers = [], onSubmit, onCancel, isLoading } = props;

  const defaultProvider =
    providers.find((provider) => provider.isDefault) || null;

  const isEditing = !!initialData;

  // Default model configuration
  const defaultModelConfig: ModelConfig = {
    model: "gpt-4o",
    temperature: AI_DEFAULTS.TEMPERATURE,
    maxTokens: AI_DEFAULTS.MAX_TOKENS,
    topP: AI_DEFAULTS.TOP_P,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(CreateAgentSchema),
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
      avatar: initialData?.avatar || "", // Optional avatar URL
    },
  });

  async function handleSubmit(data: FormData) {
    await onSubmit(data as CreateAgentInput);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <AgentIdentitySection form={form} />
        <AgentProviderSection form={form} providers={providers} />
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
