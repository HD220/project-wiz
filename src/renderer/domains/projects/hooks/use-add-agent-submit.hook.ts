import { useEffect } from "react";

import {
  AgentDto,
  CreateAgentDto,
} from "../../../../shared/types/domains/agents/agent.types";
import { useAgents } from "../../agents/hooks/use-agents.hook";

interface UseAddAgentSubmitProps {
  form: {
    formData: CreateAgentDto;
    validateForm: () => string | null;
    setError: (error: string | null) => void;
    setIsSubmitting: (submitting: boolean) => void;
    resetForm: () => void;
  };
  onAgentAdded?: (agent: AgentDto) => void;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
}

export function useAddAgentSubmit({
  form,
  onAgentAdded,
  onOpenChange,
  isOpen,
}: UseAddAgentSubmitProps) {
  const { createAgent } = useAgents();

  useEffect(() => {
    if (!isOpen) {
      form.resetForm();
    }
  }, [isOpen, form]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = form.validateForm();
    if (validationError) {
      form.setError(validationError);
      return;
    }

    form.setIsSubmitting(true);
    form.setError(null);

    try {
      const agent = await createAgent(form.formData);
      onAgentAdded?.(agent);
      onOpenChange(false);
    } catch (err) {
      form.setError(
        err instanceof Error ? err.message : "Erro ao criar agente",
      );
    } finally {
      form.setIsSubmitting(false);
    }
  };

  return { handleSubmit };
}
