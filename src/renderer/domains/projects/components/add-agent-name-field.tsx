import { TextField } from "@/components/forms/form-fields";

import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";

interface AddAgentNameFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentNameField({
  formData,
  updateField,
}: AddAgentNameFieldProps) {
  return (
    <TextField
      id="name"
      label="Nome do Agente"
      value={formData.name}
      onChange={(value) => updateField("name", value)}
      placeholder="ex: Analista de Código"
      required
    />
  );
}
