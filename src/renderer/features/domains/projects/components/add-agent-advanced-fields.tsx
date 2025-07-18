import { NumberField, TextAreaField } from "@/components/forms/form-fields";
import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";

interface FormFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

export function AddAgentTemperatureField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <NumberField
      id="temperature"
      label="Temperatura"
      value={formData.temperature}
      onChange={(value) => updateField("temperature", value)}
      min={0}
      max={2}
      step={0.1}
      required
    />
  );
}

export function AddAgentTokensField({ formData, updateField }: FormFieldProps) {
  return (
    <NumberField
      id="maxTokens"
      label="Tokens Máximos"
      value={formData.maxTokens}
      onChange={(value) => updateField("maxTokens", value)}
      min={100}
      max={4000}
      step={100}
      required
    />
  );
}

export function AddAgentIterationsField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <NumberField
      id="maxIterations"
      label="Iterações Máximas"
      value={formData.maxIterations}
      onChange={(value) => updateField("maxIterations", value)}
      min={1}
      max={10}
      step={1}
      required
    />
  );
}

export function AddAgentSystemPromptField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <TextAreaField
      id="systemPrompt"
      label="Prompt do Sistema"
      value={formData.systemPrompt}
      onChange={(value) => updateField("systemPrompt", value)}
      placeholder="Instruções específicas para o comportamento do agente..."
      rows={6}
    />
  );
}

export function AddAgentOptionsFields({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => updateField("isActive", e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Ativo
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => updateField("isDefault", e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isDefault" className="text-sm font-medium">
          Padrão
        </label>
      </div>
    </div>
  );
}

export function AddAgentAdvancedFields({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <AddAgentTemperatureField
          formData={formData}
          updateField={updateField}
        />
        <AddAgentTokensField formData={formData} updateField={updateField} />
      </div>

      <AddAgentIterationsField formData={formData} updateField={updateField} />
      <AddAgentSystemPromptField
        formData={formData}
        updateField={updateField}
      />
      <AddAgentOptionsFields formData={formData} updateField={updateField} />
    </div>
  );
}
