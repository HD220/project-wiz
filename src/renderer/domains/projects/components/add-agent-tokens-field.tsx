import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentTokensFieldProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
}

export function AddAgentTokensField({
  formData,
  updateField,
}: AddAgentTokensFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="maxTokens">Max Tokens</Label>
      <Input
        id="maxTokens"
        type="number"
        min="100"
        max="8000"
        value={formData.maxTokens}
        onChange={(e) => updateField("maxTokens", parseInt(e.target.value))}
      />
    </div>
  );
}
