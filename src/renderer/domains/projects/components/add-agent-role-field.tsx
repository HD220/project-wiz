import { Brain } from "lucide-react";

import { TextField } from "@/components/forms/form-fields";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentRoleFieldProps {
  formData: CreateAgentDto;
  updateField: <T extends keyof CreateAgentDto>(
    field: T,
    value: CreateAgentDto[T],
  ) => void;
}

export function AddAgentRoleField({
  formData,
  updateField,
}: AddAgentRoleFieldProps) {
  return (
    <TextField
      id="role"
      label="Função/Especialidade"
      value={formData.role}
      onChange={(value) => updateField("role", value)}
      placeholder="ex: Senior Python Developer"
      icon={Brain}
      required
    />
  );
}
