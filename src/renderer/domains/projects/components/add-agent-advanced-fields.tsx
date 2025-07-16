import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";
import { AddAgentTemperatureField } from "./add-agent-temperature-field";
import { AddAgentTokensField } from "./add-agent-tokens-field";
import { AddAgentIterationsField } from "./add-agent-iterations-field";
import { AddAgentSystemPromptField } from "./add-agent-system-prompt-field";
import { AddAgentOptionsFields } from "./add-agent-options-fields";

interface AddAgentAdvancedFieldsProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
}

export function AddAgentAdvancedFields({
  formData,
  updateField,
}: AddAgentAdvancedFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <AddAgentTemperatureField formData={formData} updateField={updateField} />
        <AddAgentTokensField formData={formData} updateField={updateField} />
      </div>

      <AddAgentIterationsField formData={formData} updateField={updateField} />
      <AddAgentSystemPromptField formData={formData} updateField={updateField} />
      <AddAgentOptionsFields formData={formData} updateField={updateField} />
    </div>
  );
}