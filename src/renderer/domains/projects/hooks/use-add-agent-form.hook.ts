import { useState } from "react";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

export function useAddAgentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAgentDto>({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    llmProviderId: "",
    verbose: false,
    allowDelegation: false,
    maxIterations: 10,
    temperature: 0.1,
    maxTokens: 4000,
    systemPrompt: "",
  });

  const updateField = (field: keyof CreateAgentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Nome é obrigatório";
    if (!formData.role.trim()) return "Função é obrigatória";
    if (!formData.goal.trim()) return "Objetivo é obrigatório";
    if (!formData.backstory.trim()) return "História de fundo é obrigatória";
    if (!formData.llmProviderId) return "Provedor LLM é obrigatório";
    return null;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      goal: "",
      backstory: "",
      llmProviderId: "",
      verbose: false,
      allowDelegation: false,
      maxIterations: 10,
      temperature: 0.1,
      maxTokens: 4000,
      systemPrompt: "",
    });
    setError(null);
  };

  return {
    formData,
    updateField,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    validateForm,
    resetForm,
  };
}
