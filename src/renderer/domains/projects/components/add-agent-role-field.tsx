import { Brain } from "lucide-react";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AddAgentRoleFieldProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
}

export function AddAgentRoleField({
  formData,
  updateField,
}: AddAgentRoleFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role" className="flex items-center gap-2">
        <Brain className="w-4 h-4" />
        Função/Especialidade
      </Label>
      <Input
        id="role"
        value={formData.role}
        onChange={(e) => updateField("role", e.target.value)}
        placeholder="ex: Senior Python Developer"
      />
    </div>
  );
}
