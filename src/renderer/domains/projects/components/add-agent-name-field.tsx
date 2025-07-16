import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

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
    <div className="space-y-2">
      <Label htmlFor="name">Nome do Agente</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(evt) => updateField("name", evt.target.value)}
        placeholder="ex: Analista de Código"
      />
    </div>
  );
}
