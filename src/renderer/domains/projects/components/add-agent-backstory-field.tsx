import { BookOpen } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/ui/textarea";

import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";

interface AddAgentBackstoryFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentBackstoryField({
  formData,
  updateField,
}: AddAgentBackstoryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="backstory" className="flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        História de Fundo
      </Label>
      <Textarea
        id="backstory"
        value={formData.backstory}
        onChange={(event) => updateField("backstory", event.target.value)}
        placeholder="Contexto e experiência do agente..."
        rows={3}
      />
    </div>
  );
}
