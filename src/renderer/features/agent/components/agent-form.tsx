import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Form } from "@/renderer/components/ui/form";
import { Separator } from "@/renderer/components/ui/separator";
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
        <h2 className="text-xl font-semibold tracking-tight">
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
            <AgentIdentitySection form={form} />
          </section>

          {/* Agent Provider Section */}
          <section aria-labelledby="provider-section">
            <AgentProviderSection form={form} providers={providers} />
          </section>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border/50">
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

export { AgentForm };
