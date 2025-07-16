import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";
import type { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface AddAgentLlmProviderFieldProps {
  formData: CreateAgentDto;
  updateField: (
    field: keyof CreateAgentDto,
    value: CreateAgentDto[keyof CreateAgentDto],
  ) => void;
  llmProviders: LlmProviderDto[];
}

export function AddAgentLlmProviderField({
  formData,
  updateField,
  llmProviders,
}: AddAgentLlmProviderFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Provedor LLM</Label>
      <Select
        value={formData.llmProviderId}
        onValueChange={(value: string) => updateField("llmProviderId", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um provedor..." />
        </SelectTrigger>
        <SelectContent>
          {llmProviders.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name} ({provider.providerType})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
