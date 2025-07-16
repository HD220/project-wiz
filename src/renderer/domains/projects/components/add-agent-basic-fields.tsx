import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";
import { AddAgentNameField } from "./add-agent-name-field";
import { AddAgentRoleField } from "./add-agent-role-field";
import { AddAgentGoalField } from "./add-agent-goal-field";
import { AddAgentBackstoryField } from "./add-agent-backstory-field";
import { AddAgentLlmProviderField } from "./add-agent-llm-provider-field";

interface AddAgentBasicFieldsProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
  llmProviders: any[];
}

export function AddAgentBasicFields({
  formData,
  updateField,
  llmProviders,
}: AddAgentBasicFieldsProps) {
  return (
    <div className="space-y-4">
      <AddAgentNameField formData={formData} updateField={updateField} />
      <AddAgentRoleField formData={formData} updateField={updateField} />
      <AddAgentGoalField formData={formData} updateField={updateField} />
      <AddAgentBackstoryField formData={formData} updateField={updateField} />
      <AddAgentLlmProviderField
        formData={formData}
        updateField={updateField}
        llmProviders={llmProviders}
      />
    </div>
  );
}