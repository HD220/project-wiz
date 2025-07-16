import { Target } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";

interface AddAgentGoalFieldProps {
  formData: CreateAgentDto;
  updateField: (
    field: keyof CreateAgentDto,
    value: CreateAgentDto[keyof CreateAgentDto],
  ) => void;
}

export function AddAgentGoalField({
  formData,
  updateField,
}: AddAgentGoalFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="goal" className="flex items-center gap-2">
        <Target className="w-4 h-4" />
        Objetivo Principal
      </Label>
      <Textarea
        id="goal"
        value={formData.goal}
        onChange={(event) => updateField("goal", event.target.value)}
        placeholder="Descreva o objetivo principal deste agente..."
        rows={3}
      />
    </div>
  );
}
