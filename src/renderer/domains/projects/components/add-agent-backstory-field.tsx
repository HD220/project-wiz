import { BookOpen } from "lucide-react";

import { TextAreaField } from "@/components/forms/form-fields";

import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";

interface AddAgentBackstoryFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentBackstoryField({
  formData,
  updateField,
}: AddAgentBackstoryFieldProps) {
  return (
    <TextAreaField
      id="backstory"
      label="História de Fundo"
      value={formData.backstory}
      onChange={(value) => updateField("backstory", value)}
      placeholder="Contexto e experiência do agente..."
      icon={BookOpen}
      rows={3}
    />
  );
}
