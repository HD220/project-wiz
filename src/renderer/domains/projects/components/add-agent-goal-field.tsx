import { Target } from "lucide-react";

import { TextAreaField } from "@/components/forms/form-fields";

import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";

interface AddAgentGoalFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentGoalField({
  formData,
  updateField,
}: AddAgentGoalFieldProps) {
  return (
    <TextAreaField
      id="goal"
      label="Objetivo Principal"
      value={formData.goal}
      onChange={(value) => updateField("goal", value)}
      placeholder="Descreva o objetivo principal deste agente..."
      icon={Target}
      rows={3}
    />
  );
}
