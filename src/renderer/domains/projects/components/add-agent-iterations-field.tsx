import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentIterationsFieldProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
}

export function AddAgentIterationsField({
  formData,
  updateField,
}: AddAgentIterationsFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="maxIterations">Máximo de Iterações</Label>
      <Input
        id="maxIterations"
        type="number"
        min="1"
        max="50"
        value={formData.maxIterations}
        onChange={(e) =>
          updateField("maxIterations", parseInt(e.target.value))
        }
      />
    </div>
  );
}