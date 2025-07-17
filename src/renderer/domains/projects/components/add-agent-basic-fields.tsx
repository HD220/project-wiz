import { Brain } from "lucide-react";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/forms/form-fields";
import { FieldUtils } from "@/lib/field-utils";
import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";
import type { LlmProviderDto } from "@/shared/types/domains/llm/llm-provider.types";

interface FormFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentNameField({ formData, updateField }: FormFieldProps) {
  return (
    <TextField
      id="name"
      label="Nome do Agente"
      value={formData.name}
      onChange={(value) => updateField("name", value)}
      placeholder="ex: Analista de Código"
      transformer={FieldUtils.transformers.normalizeText}
      required
    />
  );
}

export function AddAgentRoleField({ formData, updateField }: FormFieldProps) {
  return (
    <TextField
      id="role"
      label="Função/Especialidade"
      value={formData.role}
      onChange={(value) => updateField("role", value)}
      placeholder="ex: Senior Python Developer"
      icon={Brain}
      required
    />
  );
}

export function AddAgentGoalField({ formData, updateField }: FormFieldProps) {
  return (
    <TextAreaField
      id="goal"
      label="Objetivo Principal"
      value={formData.goal}
      onChange={(value) => updateField("goal", value)}
      placeholder="Descreva o objetivo principal deste agente..."
      rows={3}
      required
    />
  );
}

export function AddAgentBackstoryField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <TextAreaField
      id="backstory"
      label="Histórico/Contexto"
      value={formData.backstory}
      onChange={(value) => updateField("backstory", value)}
      placeholder="Forneça contexto sobre a experiência e conhecimento do agente..."
      rows={4}
    />
  );
}

interface LlmProviderFieldProps extends FormFieldProps {
  llmProviders: LlmProviderDto[];
}

export function AddAgentLlmProviderField({
  formData,
  updateField,
  llmProviders,
}: LlmProviderFieldProps) {
  return (
    <SelectField
      id="llmProviderId"
      label="Provedor LLM"
      value={formData.llmProviderId}
      onChange={(value) => updateField("llmProviderId", value)}
      placeholder="Selecione um provedor..."
      options={llmProviders.map((provider) => ({
        value: provider.id,
        label: `${provider.name} (${provider.model})`,
      }))}
      required
    />
  );
}

export function AddAgentBasicFields({
  formData,
  updateField,
  llmProviders,
}: LlmProviderFieldProps) {
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
