import { AddAgentBackstoryField } from "./add-agent-backstory-field";
import { AddAgentGoalField } from "./add-agent-goal-field";
import { AddAgentLlmProviderField } from "./add-agent-llm-provider-field";
import { AddAgentNameField } from "./add-agent-name-field";
import { AddAgentRoleField } from "./add-agent-role-field";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";
import type { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface AddAgentBasicFieldsProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: CreateAgentDto[keyof CreateAgentDto]) => void;
  llmProviders: LlmProviderDto[];
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
