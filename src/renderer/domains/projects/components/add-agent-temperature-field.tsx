import { NumberField } from "@/components/forms/form-fields";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentTemperatureFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentTemperatureField({
  formData,
  updateField,
}: AddAgentTemperatureFieldProps) {
  return (
    <NumberField
      id="temperature"
      label="Temperatura"
      value={formData.temperature}
      onChange={(value) => updateField("temperature", value)}
      min={0}
      max={2}
      step={0.1}
      required
    />
  );
}
