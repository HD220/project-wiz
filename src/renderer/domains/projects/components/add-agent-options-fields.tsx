import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentOptionsFieldsProps {
  formData: CreateAgentDto;
  updateField: <T extends keyof CreateAgentDto>(
    field: T,
    value: CreateAgentDto[T],
  ) => void;
}

export function AddAgentOptionsFields({
  formData,
  updateField,
}: AddAgentOptionsFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive ?? true}
          onCheckedChange={(checked) =>
            updateField("isActive", checked as boolean)
          }
        />
        <Label htmlFor="isActive">Agente ativo</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault ?? false}
          onCheckedChange={(checked) =>
            updateField("isDefault", checked as boolean)
          }
        />
        <Label htmlFor="isDefault">Definir como agente padrão</Label>
      </div>
    </div>
  );
}
