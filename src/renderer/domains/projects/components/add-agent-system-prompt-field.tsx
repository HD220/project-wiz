import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentSystemPromptFieldProps {
  formData: CreateAgentDto;
  updateField: (
    field: keyof CreateAgentDto,
    value: CreateAgentDto[keyof CreateAgentDto],
  ) => void;
}

export function AddAgentSystemPromptField({
  formData,
  updateField,
}: AddAgentSystemPromptFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="systemPrompt">Prompt do Sistema (Opcional)</Label>
      <Textarea
        id="systemPrompt"
        value={formData.systemPrompt}
        onChange={(event) => updateField("systemPrompt", event.target.value)}
        placeholder="Instruções adicionais para o agente..."
        rows={3}
      />
    </div>
  );
}
