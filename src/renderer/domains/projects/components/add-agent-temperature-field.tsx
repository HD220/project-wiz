import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentTemperatureFieldProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
}

export function AddAgentTemperatureField({
  formData,
  updateField,
}: AddAgentTemperatureFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="temperature">Temperatura</Label>
      <Input
        id="temperature"
        type="number"
        min="0"
        max="2"
        step="0.1"
        value={formData.temperature}
        onChange={(e) => updateField("temperature", parseFloat(e.target.value))}
      />
    </div>
  );
}
