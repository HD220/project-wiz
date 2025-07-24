import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AI_DEFAULTS } from "@/main/constants/ai-defaults";
import { createAgentSchema } from "@/main/features/agent/agent.types";
import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Form } from "@/renderer/components/ui/form";
import type {
  SelectAgent,
  CreateAgentInput,
  ModelConfig,
} from "@/renderer/features/agent/agent.types";

import { AgentFormActions } from "./agent-form-actions";
import { AgentIdentitySection } from "./agent-form-identity-section";
import { AgentProviderSection } from "./agent-form-provider-section";

type FormData = z.infer<typeof createAgentSchema>;

interface AgentFormProps {
  initialData?: SelectAgent | null;
  providers?: LlmProvider[];
  onSubmit: (data: CreateAgentInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function AgentForm(props: AgentFormProps) {
  const { initialData, providers = [], onSubmit, onCancel, isLoading } = props;

  const defaultProvider = providers.find((p) => p.isDefault) || null;

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <AgentIdentitySection form={form} />
        <AgentProviderSection form={form} providers={providers} />
        <AgentFormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEditing={isEditing}
        />
      </form>
    </Form>
  );
}

export { AgentForm };
