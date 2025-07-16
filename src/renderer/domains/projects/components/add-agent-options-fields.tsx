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
          id="verbose"
          checked={formData.verbose}
          onCheckedChange={(checked) => updateField("verbose", checked)}
        />
        <Label htmlFor="verbose">Modo verboso (logs detalhados)</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="allowDelegation"
          checked={formData.allowDelegation}
          onCheckedChange={(checked) => updateField("allowDelegation", checked)}
        />
        <Label htmlFor="allowDelegation">
          Permitir delegação para outros agentes
        </Label>
      </div>
    </div>
  );
}
